#!/usr/bin/env node
/**
 * 生成 Cloudflare Pages 的部署目录
 *
 * 为什么需要这一步：
 *   Cloudflare Pages 单个静态资源上限 25 MiB（20,000 文件）。
 *   项目里 music/ 有 36 个文件超过这个上限（32 个 MV + 4 个 mp3），
 *   直接把整个目录传上去会整包失败。所以先在这里把超限文件剔掉，
 *   生成一个干净的上传目录，再交给 wrangler。
 *
 * 为什么不压缩：
 *   音质/画质不动，超过 25 MiB 的文件一律不上线（用户 2026-11-08 决定）。
 *   这些文件在本地和 Git 仓库里照旧保留，只是不进 Cloudflare 的发布产物。
 *
 * 用法：
 *   node deploy-cf.mjs              生成 .cf-dist/ 并打印统计
 *   node deploy-cf.mjs --dry        只统计，不写文件
 *   node deploy-cf.mjs --copy       用真实复制（默认是硬链接，秒级且不占额外磁盘）
 *   node deploy-cf.mjs --upload     生成后直接调用 wrangler 上传
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT_NAME = '.cf-dist';
const OUT = path.join(ROOT, OUT_NAME);

// Cloudflare Pages 硬上限
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MiB
const MAX_FILES = 20000;

// 完全不需要进发布产物的目录（任意层级匹配目录名）
const SKIP_DIRS = new Set([
	'node_modules',
	'.git',
	'.github',
	'.wrangler',
	'.cf-dist',
	'backend',          // Netlify Functions / 本地 express 服务，Cloudflare 版用 functions/ 代替
	'__pycache__'
]);

// 根目录下不需要发布的文件
const SKIP_ROOT_FILES = new Set([
	'netlify.toml',
	'package.json',
	'package-lock.json',
	'build-functions.js',
	'deploy-cf.mjs',
	'.gitignore',
	'.gitattributes',
	'Start.cmd'
]);

const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry');
const USE_COPY = args.has('--copy');
const UPLOAD = args.has('--upload');

const skippedBig = [];
const skippedDirs = [];
let fileCount = 0;
let totalBytes = 0;

function walk(dir, relBase) {
	let entries;
	try {
		entries = fs.readdirSync(dir, { withFileTypes: true });
	} catch (e) {
		console.warn('读取失败，跳过：', relBase, e.code);
		return;
	}

	for (const ent of entries) {
		const abs = path.join(dir, ent.name);
		const rel = relBase ? relBase + '/' + ent.name : ent.name;

		if (ent.isDirectory()) {
			if (SKIP_DIRS.has(ent.name)) {
				skippedDirs.push(rel);
				continue;
			}
			if (!DRY) fs.mkdirSync(path.join(OUT, rel), { recursive: true });
			walk(abs, rel);
			continue;
		}

		if (!ent.isFile()) continue;

		// 根目录白名单外的杂项
		if (!relBase && SKIP_ROOT_FILES.has(ent.name)) continue;
		// 根目录的开发脚本（Python 维护工具）和说明文档不进发布产物
		if (!relBase && /\.(py|md|ps1|bat|sh)$/i.test(ent.name)) continue;
		if (/\.md$/i.test(ent.name)) continue;

		let st;
		try {
			st = fs.statSync(abs);
		} catch (e) {
			console.warn('stat 失败，跳过：', rel);
			continue;
		}

		if (st.size > MAX_FILE_SIZE) {
			skippedBig.push({ rel, size: st.size });
			continue;
		}

		fileCount++;
		totalBytes += st.size;

		if (DRY) continue;

		const target = path.join(OUT, rel);
		fs.mkdirSync(path.dirname(target), { recursive: true });
		if (USE_COPY) {
			fs.copyFileSync(abs, target);
		} else {
			try {
				fs.linkSync(abs, target); // 硬链接：不占额外空间，秒级
			} catch (e) {
				fs.copyFileSync(abs, target);
			}
		}
	}
}

function mb(n) {
	return (n / 1024 / 1024).toFixed(1);
}

console.log('项目根目录：', ROOT);
console.log(DRY ? '模式：试运行（不写文件）\n' : '模式：' + (USE_COPY ? '复制' : '硬链接') + '\n');

if (!DRY) {
	if (!OUT.startsWith(ROOT)) throw new Error('输出目录必须在项目内');
	fs.rmSync(OUT, { recursive: true, force: true });
	fs.mkdirSync(OUT, { recursive: true });
}

walk(ROOT, '');

console.log('== 统计 ==');
console.log('将上传文件数：' + fileCount + ' / ' + MAX_FILES);
console.log('将上传体积：' + mb(totalBytes) + ' MB');
console.log('跳过的目录：' + skippedDirs.length + ' 个');
skippedDirs.slice(0, 8).forEach(d => console.log('   - ' + d));
if (skippedDirs.length > 8) console.log('   ……');

console.log('\n因超过 25 MiB 未上传：' + skippedBig.length + ' 个（合计 ' + mb(skippedBig.reduce((s, x) => s + x.size, 0)) + ' MB）');
skippedBig.sort((a, b) => b.size - a.size);
skippedBig.forEach(x => console.log('   - ' + mb(x.size) + ' MB  ' + x.rel));

if (fileCount > MAX_FILES) {
	console.error('\n文件数超过 Cloudflare Pages 上限（20000），部署会失败。');
	process.exitCode = 1;
}

if (!DRY) {
	const report = [
		'# 本次未上传的文件（超过 25 MiB）',
		'',
		...skippedBig.map(x => mb(x.size) + ' MB\t' + x.rel)
	].join('\n');
	fs.writeFileSync(path.join(ROOT, OUT_NAME + '-skipped.txt'), report, 'utf8');
	console.log('\n清单已写入：' + OUT_NAME + '-skipped.txt');
	console.log('部署目录：' + OUT);
}

if (UPLOAD) {
	console.log('\n== 开始上传 ==');
	const r = spawnSync('npx', ['wrangler', 'pages', 'deploy', OUT_NAME, '--project-name', 'onelove'], {
		cwd: ROOT,
		stdio: 'inherit',
		shell: true
	});
	process.exitCode = r.status || 0;
}
