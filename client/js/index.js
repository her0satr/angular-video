var helper = {
	// cookie
	setCookie: function(cname, cvalue, exdays) {
		var d = new Date();
		d.setTime(d.getTime() + (exdays*24*60*60*1000));
		var expires = "expires="+ d.toUTCString();
		document.cookie = cname + "=" + cvalue + "; " + expires;
	},
	getCookie: function(cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for(var i = 0; i <ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length,c.length);
			}
		}
		return "";
	},
	
	// user
	isLogin: function() {
		var result = false;
		var user = this.getUser();
		if (user.username != null && user.sessionId != null) {
			result = true;
		}
		return result;
	},
	getUser: function() {
		var temp = helper.getCookie('users');
		temp = (temp == '') ? '{}' : temp;
		eval('var user = ' + temp);
		
		return user;
	},
	
	
	// common
	truncateText: function(stringText, maxLength) {
		if (stringText.length > maxLength) {
			stringText = stringText.substr(0, maxLength) + '...';
		}
		
		return stringText;
	}
}

var app = angular.module("myApp", []);
app.controller("AppCtrl", function($scope, $http) {
	// page
	$scope.page = {
		init: function() {
			// set sign as default
			$scope.page.show_sign_in();
			
			// event on scroll
			document.onscroll = function() {
				// return if video is loading
				if ($scope.page.video.isLoadVideo) {
					return;
				}
				
				// load video
				if ($scope.page.video_list) {
					var offsetHeight = window.innerHeight + window.pageYOffset + 10;
					if (offsetHeight >= document.body.scrollHeight) {
						$scope.page.video.load();
					}
				}
			};
		},
		show_sign_in: function() {
			$scope.page.video_list = false;
			$scope.page.video_play = false;
			$scope.page.signin = true;
			$scope.page.breadcrumb = false;
		},
		show_video_list: function() {
			$scope.page.breadcrumb = true;
			$scope.page.video_list = true;
			$scope.page.video_play = false;
			$scope.page.signin = false;
		},
		show_video_play: function() {
			$scope.page.video_list = false;
			$scope.page.video_play = true;
			$scope.page.signin = false;
			$scope.page.breadcrumb = true;
		},
		multiLogin: function() {
			$scope.page.show_sign_in();
			helper.setCookie('users', '');
		},
		video: {
			isLoadVideo: false,
			load: function() {
				// load video
				$scope.page.video.isLoadVideo = true;
				$http.get('/videos?sessionId=' + $scope.users.sessionId + '&skip=' + $scope.array_video.length + '&limit=10').error($scope.page.multiLogin).success(function(response) {
					if (response.status == 'success') {
						if (response.data.length > 0) {
							$scope.page.video.isLoadVideo = false;
							for (var i = 0; i < response.data.length; i++) {
								$scope.array_video.push($scope.page.video.sync(response.data[i]));
							}
						} else {
							$scope.page.video_list_info = true;
						}
					}
				});
			},
			sync: function(row) {
				// short description
				row.descriptionShort = helper.truncateText(row.description, 90);
				
				// average rating
				var total = 0;
				for (var i = 0; i < row.ratings.length; i++) {
					total += row.ratings[i];
				}
				row.rating_average = total / row.ratings.length;
				row.rating_average_text = row.rating_average.toFixed(1);
				
				return row;
			}
		}
	};
	$scope.page.init();
	
	// sign in
	$scope.users = {};
	$scope.form_info = '';
	$scope.formSignIn = function() {
		$http.post('/user/auth', { username: $scope.users.username, password: md5($scope.users.password) }).success(function(response) {
			if (response.status == 'error') {
				$scope.form_info = response.error;
			} else if (response.status == 'success') {
				// set sessionId
				$scope.users.sessionId = response.sessionId;
				helper.setCookie('users', '{username:"' + $scope.users.username + '",sessionId:"' + response.sessionId + '"}');
				
				// load video
				$scope.form_info = '';
				$scope.page.video.load();
				$scope.page.show_video_list();
			}
		});
	}
	$scope.emptyFormInfo = function() {
		return ($scope.form_info == '') ? true : false;
	}
	$scope.formSignOut = function() {
		helper.setCookie('users', '');
		$http.get('/user/logout?sessionId=' + $scope.users.sessionId).error($scope.page.multiLogin).success(function(response) {
			$scope.page.show_sign_in();
		});
	}
	
	// video
	$scope.video = {};
	$scope.array_video = [];
	$scope.videoPlay = function(video) {
		$http.get('/video?sessionId=' + $scope.users.sessionId + '&videoId=' + video._id).error($scope.page.multiLogin).success(function(response) {
			$scope.video = $scope.page.video.sync(response.data);
			$scope.page.show_video_play();
			
			// render video + cross browser issue
			var video_html = '<video id="videoPlayer" width="100%" controls autoplay>';
			video_html += '<source src="' + $scope.video.url + '" type="video/mp4">';
			video_html += 'Your browser does not support the video tag.';
			video_html += '</video>';
			angular.element(document.querySelector('#videoContainer')).html(video_html);
			
			// load sidebar video
			var video_side = '<video width="100%">';
			video_side += '<source src="' + $scope.video.url + '" type="video/mp4">';
			video_side += 'Your browser does not support the video tag.';
			video_side += '</video>';
			for (var i = 0; i < document.getElementsByClassName('video-side').length; i++) {
				document.getElementsByClassName('video-side')[i].innerHTML = video_side;
			}
		});
	};
	$scope.videoBack = function() {
		// pause video
		var player = document.getElementById('videoPlayer');
		player.pause();
		
		// show video list
		$scope.page.show_video_list()
	}
	
	// rate
	$scope.rateOption = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
	$scope.selectOption = $scope.rateOption[0];
	$scope.updateRate = function(video) {
		$http.post('/video/ratings?sessionId=' + $scope.users.sessionId, { videoId: video._id, rating: $scope.selectOption.id })
			.error($scope.page.multiLogin)
			.success(function(response) {
				if (response.status == 'success') {
					// update video
					var video = $scope.page.video.sync(response.data);
					$scope.video.ratings = video.ratings;
					$scope.video.rating_average = video.rating_average;
					$scope.video.rating_average_text = video.rating_average_text;
				}
			}
		);
	}
	
	// if user already sign in
	if (helper.isLogin()) {
		// set user
		$scope.users = helper.getUser();
		
		// load & display video
		$scope.page.show_video_list();
		$scope.page.video.load();
	}
});
