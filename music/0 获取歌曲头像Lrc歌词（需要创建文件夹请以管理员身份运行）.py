import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import re
import os
import time

# 歌曲名称列表
song_names = [
    # "DJ马哥 - 最火OK (DJ版)",
    # "DJ河园 - 青海摇",
]

# 创建保存头像和歌词文件的文件夹
if not os.path.exists("pic_files"):
    os.mkdir("pic_files")
    print("创建文件夹pic_files成功")
if not os.path.exists("lrc_files"):
    os.mkdir("lrc_files")
    print("创建文件夹lrc_files成功")

# 模拟浏览器头部信息
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Referer": "https://music.163.com/",
}


# 获取歌曲信息
def get_song_info(song_name):
    """参数
    {
        s: "歌名或者歌手", // 关键词
        type: 1, //单曲(1)，歌手(100)，专辑(10)，歌单(1000)，用户(1002)
        offset: 0, // 偏移量
        total: true, // 是否加上总数等信息
        limit: 15 // 结果数
    }
    """
    url = f"https://music.163.com/api/search/get?s={song_name}&type=1&offset=0&limit=5"
    # 发送请求
    response = requests.get(url, headers=headers)
    data = response.json()
    song_list = data["result"]["songs"]
    return song_list
    # for song in song_list:
    #     song_id = song["id"]
    #     song_name = song["name"]
    #     artist_name = song["artists"][0]["name"]
    #     album_name = song["album"]["name"]
    #     print(f"歌曲ID: {song_id}")
    #     print(f"歌曲名称: {song_name}")
    #     print(f"歌手名称: {artist_name}")
    #     print(f"专辑名称: {album_name}")


# 选择歌曲设置id
def set_song_id(song_list):
    # 列表第一个元素的id
    song_id = song_list[0]["id"]
    return song_id


# 歌词获取
def get_lrc(song_id):
    lrc_url = f"https://music.163.com/api/song/lyric?os=pc&id={song_id}&lv=-1&tv=-1"
    response = requests.get(lrc_url)
    lrc_data = response.json()
    lrc = lrc_data["lrc"]["lyric"]
    # print(lrc)
    return lrc


# 保存歌词到lrc_files
def save_lrc(lrc, song_name):
    lrc_file = f"lrc_files/{song_name}.lrc"
    with open(lrc_file, "w", encoding="utf-8") as f:
        f.write(lrc)


# 根据歌曲信息请求图片
def get_pic(songId):
    # pic_url = songInfo[0]["artists"][0]["img1v1Url"]
    # return requests.get(pic_url)
    pic_url = f"https://music.163.com/api/song/detail?ids=[{songId}]"
    response = requests.get(pic_url, headers=headers)
    data = response.json()
    return data["songs"][0]["album"]["blurPicUrl"]


# 保存图片到pic_files
def save_pic(pic, song_name):
    # 请求
    response = requests.get(pic, headers=headers)
    # 保存
    save_path = os.path.join("pic_files", f"{song_name}.png")
    with open(save_path, "wb") as f:
        f.write(response.content)


for song_name in song_names:
    songInfo = get_song_info(song_name)
    songId = set_song_id(songInfo)
    print(f"歌曲ID：{songId}")
    lrc = get_lrc(songId)
    save_lrc(lrc, song_name)
    print(f"{song_name}歌词保存成功！：{os.getcwd()}\\lrc_files\\{song_name}.lrc")
    # 头像设置
    picUrl = get_pic(songId)
    save_pic(picUrl, song_name)
    # 保存位置
    print(f"{song_name}头像保存成功！：{os.getcwd()}\\pic_files\\{song_name}.png")

print("运行结束")
