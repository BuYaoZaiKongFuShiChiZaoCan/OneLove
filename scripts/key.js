// 键盘监听
document.onkeydown = function (e) {    //对整个页面监听
	var keyNum = window.event ? e.keyCode : e.which;       //获取被按下的键值  
	// alt + k  搜索
	if (e.altKey && keyNum == 75) {
		document.activeElement.blur();
		window.input.focus();
		return;
	}

	// esc 取消搜索
	if (keyNum == 27) {
		// 取消其它元素的聚焦
		document.activeElement.blur();
		window.input.value = '';
		return;
	}

	// alt + m  聚焦audio 标签
	if (e.altKey && keyNum == 77) {
		// 取消其它元素的聚焦
		document.activeElement.blur();
		window.audio.focus();
		return;
	}

	// audio.js
	if (keyNum == 190) {//.>
		nextSong();
		tanChuang('下一首');
		return;
	}
	if (keyNum == 191) {//?/
		setTimeout(() => {
			if (musicContainer.classList.contains('play')) {
				pauseSong();
				tanChuang('暂停');
			} else {
				playSong();
				tanChuang('播放');
			}
		}, 50);
		return;
	}
	if (keyNum == 188) {//,<
		prevSong();
		tanChuang('上一首');
		return;
	}

	if (keyNum == 37) {// 左
		// alert('您按下了左');
		if (musicContainer.classList.contains('play')) {
			// 音乐进度减少5秒 用户点击了“向后搜寻”的媒体按钮
			audio.currentTime = Math.max(audio.currentTime - skipTime, 0);
			tanChuang(`后退${skipTime}秒`);
		}
		return;
	}

	if (keyNum == 39) {// 右
		// alert('您按下了右');
		if (musicContainer.classList.contains('play')) {
			// 音乐进度增加5秒 用户点击了“向前搜寻”的媒体按钮
			audio.currentTime = Math.min(audio.currentTime + skipTime, audio.duration);
			tanChuang(`前进${skipTime}秒`);
		}
		return;
	}

	// 搜索条目soSouItem
	let list_a = document.getElementById('searchSuggest').querySelectorAll('a');// 获取到列表下的a标签
	let input = document.getElementById('input');

	function js() {
		for (let index = 0; index < list_a.length; index++) {
			if (list_a[index] == document.activeElement) {
				return index;
			}
		}
	}

	if (keyNum == 38) {
		// 阻止默认事件
		e.preventDefault();

		// alert('您按下了up');
		if (list_a.length == 0) {
			tanChuang('列表为空，请输入正确的内容');
			return;
		} else {
			js()
			if (js() == undefined) {
				list_a[0].focus();
				input.value = list_a[0].textContent;
				list_a[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
				return;
			} else {
				if (js() <= 0) {
					list_a[list_a.length - 1].focus();
					input.value = list_a[list_a.length - 1].textContent;
					list_a[list_a.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
					return;
				} else {
					list_a[js() - 1].focus();
					input.value = list_a[js() - 1].textContent;
					list_a[js() - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
					return;
				}
			}
		}
	}

	if (keyNum == 40) {
		e.preventDefault();

		// alert('您按下了down');
		if (list_a.length == 0) {
			tanChuang('列表为空，请输入正确的内容');
			return;
		} else {
			js()
			// console.log(js());
			if (js() == undefined) {
				list_a[0].focus();
				input.value = list_a[0].textContent;
				list_a[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
				return;
			} else {
				if (js() >= list_a.length - 1) {
					list_a[0].focus();
					input.value = list_a[0].textContent;
					list_a[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
					return;
				} else {
					list_a[js() + 1].focus();
					input.value = list_a[js() + 1].textContent;
					list_a[js() + 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
					return;
				}
			}
		}
	}

	// 回车键处理
	if (keyNum == 13) {
		if (list_a.length > 0) {
			let focusedElement = document.activeElement;
			if (focusedElement && focusedElement.tagName === 'A' && focusedElement.closest('#searchSuggest')) {
				// 如果聚焦在搜索建议上，点击该链接
				focusedElement.click();
				return;
			}
		}
	}
}