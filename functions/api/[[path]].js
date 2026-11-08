/**
 * Cloudflare Pages Functions —— /api/* 的占位实现
 *
 * 背景：原来的后端是 backend/netlify-functions/api.js（1340 行 express + mongoose），
 * 跑在 Netlify Functions 上。线上 /api/health 返回的 "database":"disconnected" 说明
 * MongoDB 从来没连上过（netlify.toml 里 MONGODB_URI 一直是占位符），
 * 所以登录 / 注册 / 密码管理这些依赖数据库的接口本来就是不可用的。
 *
 * 整个站点对后端的真实依赖只有一处：scripts/auth.js:70 的 GET /api/auth/me，
 * 用来校验 localStorage 里的 token 是否仍然有效。拿不到 token 就视为未登录，
 * 前端已经 catch 住异常、不会影响听歌等任何功能。
 *
 * 所以这里不重写那 1340 行，只保留两个探针接口，其余一律按「未认证」返回，
 * 保持与旧后端一致的行为（旧后端无 token 时也是 401 + {success:false}）。
 *
 * 以后若要恢复真正的账号体系，把数据库换成 Cloudflare D1 / KV，
 * 在这个文件里按路径分发即可，前端不用改。
 */

const JSON_HEADERS = {
	'Content-Type': 'application/json; charset=utf-8',
	// 同源请求为主，但 Pages 项目预览域名（*.pages.dev）也在用，放开更省事
	'Access-Control-Allow-Origin': '*',
	'Cache-Control': 'no-store'
};

function json(body, status) {
	return new Response(JSON.stringify(body), { status: status || 200, headers: JSON_HEADERS });
}

export async function onRequest(context) {
	const url = new URL(context.request.url);
	const path = url.pathname.replace(/\/+$/, '');

	if (context.request.method === 'OPTIONS') {
		return new Response(null, {
			status: 204,
			headers: {
				...JSON_HEADERS,
				'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type,Authorization'
			}
		});
	}

	// 健康检查：部署后用来确认 Functions 路由确实生效
	if (path === '/api/health') {
		return json({
			status: 'ok',
			message: 'OneLove API is running on Cloudflare Pages Functions',
			environment: 'cloudflare-pages',
			database: 'disabled',
			timestamp: new Date().toISOString()
		});
	}

	if (path === '/api/info') {
		return json({
			success: true,
			data: { name: 'OneLove', platform: 'cloudflare-pages', version: '1.0.0' }
		});
	}

	// 其余接口（auth / changelog / timeline / userdata …）依赖数据库，本站未启用
	return json({ success: false, message: '该接口在 Cloudflare Pages 版本中未开放' }, 401);
}
