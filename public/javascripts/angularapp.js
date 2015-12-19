var app = angular.module('twl', ['ui.router']);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/views/site/home.html',
      controller: 'MainCtrl',
	  resolve: {
		  postPromise: ['blogposts', function(posts){
			  return posts.getAll();
		  }]
	  }
    })
	.state('posts', {
		url: '/posts/{id}',
		templateUrl: '/views/site/site.html',
		controller: 'PostCtrl',
		resolve: {
			post: ['$stateParams', 'blogposts', function($stateParams, posts){
				return posts.get($stateParams.id);
			}]
		}
	})
	.state('submit', {
		url: '/submit',
		templateUrl: '/views/site/sitesubmit.html',
		controller: 'SubmitCtrl'
	})
	.state('login', {
		url: '/login',
		templateUrl: '/views/login.html',
		controller: 'AuthCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(auth.isLoggedIn()){
				$state.go('home');
			}
		}]
	})
	.state('register', {
		url: '/register',
		templateUrl: '/views/register.html',
		controller: 'AuthCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(auth.isLoggedIn()){
				$state.go('home');
			}
		}]
	})
    .state('user', {
        url: '/users/{id}',
        templateUrl: '/views/users/user.html',
        controller: 'UserCtrl',
        resolve: {
            thisUser: ['$stateParams', 'userfact', function($stateParams, userfact){
                return userfact.get($stateParams.id);
            }]
        }
    });
  $urlRouterProvider.otherwise('home');
}]);

app.factory('auth', ['$http', '$window', function($http, $window){
	var auth = {};
	auth.saveToken = function(token){
		$window.localStorage['twl-token'] = token;
	};
	auth.getToken = function(){
		return $window.localStorage['twl-token'];
	};
	auth.isLoggedIn = function(){
		var token = auth.getToken();
		if (token){
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			return payload.exp > Date.now()/1000;
		}
		else {
			return false;
		}
	};
	auth.currentUser = function(){
		if (auth.isLoggedIn()){
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			return payload.username;
		}
		else {
			return '';
		}
	};
    auth.userDetails = function(){
        if (auth.isLoggedIn()){
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return payload;
        }
    };
    auth.checkUserRole = function(){
        if (auth.isLoggedIn()){
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return payload.role;
        }
    }
	auth.register = function(user){
		return $http.post('/register', user).success(function(data){
			auth.saveToken(data.token);
		});
	};
	auth.login = function(user){
		return $http.post('/login', user).success(function(data){
			auth.saveToken(data.token);
		});
	};
	auth.logout = function(){
		$window.localStorage.removeItem('twl-token');
	};
	return auth;
}]);

app.factory('userfact', ['$http', function($http, auth){
    var user = {};
    user.get = function(id){
        return $http.get('/user/' + id).then(function(res){
            return res.data;
        });
    };
    return user;
}]);

app.factory('blogposts', ['$http', 'auth', function($http, auth){
	var o = {
		posts: []
	};
	o.getAll = function(){
		return $http.get('/posts').success(function(data){
			angular.copy(data, o.posts);
		});
	};
	o.get = function(id){
		return $http.get('/posts/' + id).then(function(res){
			return res.data;
		});
	};
	o.create = function(post){
		console.log ('Authorization: \'Bearer ' + auth.getToken());
		return $http.post('/posts', post, {
			headers: {
				Authorization: 'Bearer ' + auth.getToken()
			}
		}).success(function(data){
			o.posts.push(data);
		});
	};
	o.createComment = function(id, comment){
		return $http.post('/posts/' + id + '/comments', comment, {
			headers: {
				Authorization: 'Bearer ' + auth.getToken()
			}
		});
	};
	o.upvote = function(post){
		return $http.put('/posts/' + post._id + '/upvote', null, {
			headers: {
				Authorization: 'Bearer ' + auth.getToken()
			}
		}).success(function(data){
			post.upVotes += 1;
		});
	};
	o.downvote = function(post){
		return $http.put('/posts/' + post._id + '/downvote', null, {
			headers: {
				Authorization: 'Bearer ' + auth.getToken()
			}
		}).success(function(data){
			post.upVotes -= 1;
		})
	}
	o.upVoteComment = function(post, comment){
		return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote', null, {
			headers: {
				Authorization: 'Bearer ' + auth.getToken()
			}
		}).success(function(data){
			comment.upVotes += 1;
		})
	}
	o.downVoteComment = function(post, comment){
		return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/downvote', null, {
			headers: {
				Authorization: 'Bearer ' + auth.getToken()
			}
		}).success(function(data){
			comment.upVotes -= 1;
		})
	}
	return o;
}]);

app.controller('AuthCtrl', [
	'$scope',
	'$state',
	'auth',
	function($scope, $state, auth){
		$scope.user = {};
		$scope.register = function(){
			auth.register($scope.user).error(function(error){
				$scope.error = error;
			}).then(function(){
				$state.go('home');
			})
		};
		$scope.login = function(){
			auth.login($scope.user).error(function(error){
				$scope.error = error;
			}).then(function(){
				$state.go('home');
			})
		};
}]);

app.controller('NavCtrl', [
	'$scope',
	'auth',
	function($scope, auth){
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.currentUser = auth.currentUser
        $scope.userDetails = auth.userDetails;
		$scope.logout = auth.logout;
        $scope.currUser = {};
        $scope.currUser = auth.userDetails();
}]);

app.controller('UserCtrl',[
    '$scope',
    '$state',
    'userfact',
    'thisUser',
    function($scope, $state, userfact, thisUser){
        $scope.thisUser = thisUser;
}]);

app.controller('PostCtrl', [
	'$scope',
	'blogposts',
	'post',
	'auth',
	function($scope, blogposts, post, auth){
		$scope.post = post;
		$scope.isLoggedIn = auth.isLoggedIn;
        $scope.checkUserRole = auth.checkUserRole;
		$scope.addComment = function(){
			if (!$scope.body || $scope.body === ''){
				return;
			}
			blogposts.createComment(post._id, {
				body: $scope.body,
				createdBy: 'user'
			}).success(function(comment){
				$scope.post.comments.push(comment);
			});
			$scope.body = '';
		};
		$scope.incrementUpvotes = function(post){
			blogposts.upvote(post);
		};
		$scope.decrementUpvotes = function(post){
			blogposts.downvote(post);
		};
		$scope.incrementCommentvotes = function(post, comment){
			blogposts.upVoteComment(post, comment);
		};
		$scope.decrementCommentvotes = function(post, comment){
			blogposts.downVoteComment(post, comment);
		};
	}]);

app.controller('MainCtrl', [
'$scope',
'blogposts',
'auth',
function($scope, blogposts, auth){
	$scope.posts = blogposts.posts;
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.incrementUpvotes = function(post){
		blogposts.upvote(post);
	};
	$scope.decrementUpvotes = function(post){
		blogposts.downvote(post);
	};
}]);

app.controller('SubmitCtrl', [
'$scope',
'$state',
'blogposts',
function($scope, $state, blogposts){
	$scope.addPost = function(){
		if (!$scope.title || $scope.title === ''){
			return;
		}
		blogposts.create({
			title: $scope.title,
			link: $scope.link,
			body: $scope.body,
			createDate: new Date(),
			upVotes: 0
		});
		$scope.title = '';
		$scope.body = '';
		$scope.link = '';
		$state.go('home', {});
	};
}]);