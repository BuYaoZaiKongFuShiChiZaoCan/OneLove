import os
import re

# 读取 audioList.js 文件
with open('scripts/audioList.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 提取 songs 数组内容
songs_match = re.search(r'let\s+songs\s*=\s*\[(.*?)\]', content, re.DOTALL)
if not songs_match:
    print("未找到 songs 数组")
    exit(1)

songs_content = songs_match.group(1)

# 提取所有歌曲名称 (去除引号和逗号)
songs_in_list = set()
for line in songs_content.split('\n'):
    line = line.strip()
    if line and not line.startswith('/*') and not line.startswith('*') and not line.startswith('//'):
        # 移除注释部分
        if '//' in line:
            line = line.split('//')[0].strip()
        # 提取引号内的内容
        match = re.match(r'["\'](.*?)["\']', line)
        if match:
            song_name = match.group(1).strip()
            if song_name:
                songs_in_list.add(song_name)

print(f"songs 列表中的歌曲数量：{len(songs_in_list)}")

# 获取 music 文件夹下的所有 mp3 文件 (不包括子目录)
music_dir = 'music'
mp3_files = []

for file in os.listdir(music_dir):
    file_path = os.path.join(music_dir, file)
    if os.path.isfile(file_path) and file.endswith('.mp3'):
        # 去除 .mp3 后缀
        file_name = file[:-4]
        mp3_files.append(file_name)

print(f"music 文件夹下的 mp3 文件数量：{len(mp3_files)}")

# 找出在 mp3 文件中存在但在 songs 列表中不存在的歌曲
missing_songs = []
for mp3_file in mp3_files:
    # 进行模糊匹配，去除空格和特殊字符后比较
    found = False
    for song_in_list in songs_in_list:
        # 简单匹配：直接比较
        if mp3_file == song_in_list:
            found = True
            break
        # 模糊匹配：去除空格、标点符号等
        elif re.sub(r'[\s\-\(\)\(\)_,_.,_\+]', '', mp3_file) == re.sub(r'[\s\-\(\)\(\)_,_.,_\+]', '', song_in_list):
            found = True
            break
    
    if not found:
        missing_songs.append(mp3_file)

print(f"\n找到的缺失歌曲数量：{len(missing_songs)}")
print("\n缺失的歌曲列表:")
print("=" * 80)

for i, song in enumerate(sorted(missing_songs), 1):
    print(f"{i}. {song}")

print("=" * 80)
print(f"\n总计：{len(missing_songs)} 首歌曲不在 songs 列表中")

# 生成可以添加到 songs 数组的格式
print("\n\n可以直接添加到 songs 数组的格式:")
print("=" * 80)
for song in sorted(missing_songs):
    print(f'"{song}",')
print("=" * 80)
