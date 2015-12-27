var app = angular.module('twl', ['ui.router', 'angularUtils.directives.dirPagination']);

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
		  postPromise: ['siteFact', function(sites){
			  return sites.getAll();
		  }]
	  }
    })
	.state('sites', {
		url: '/sites/{id}',
		templateUrl: '/views/site/site.html',
		controller: 'PostCtrl',
		resolve: {
			site: ['$stateParams', 'siteFact', function($stateParams, sites){
				return sites.get($stateParams.id);
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
            thisUser: ['$stateParams', 'userFact', function($stateParams, userFact){
                return userFact.get($stateParams.id);
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

app.factory('userFact', ['$http', function($http, auth){
    var user = {};
    user.get = function(id){
        return $http.get('/user/' + id).then(function(res){
            return res.data;
        });
    };
    return user;
}]);

app.factory('siteFact', ['$http', 'auth', function($http, auth){
	var o = {
		sites: []
	};
	o.getAll = function(){
		return $http.get('/sites').success(function(data){
			angular.copy(data, o.sites);
		});
	};
	o.get = function(id){
		return $http.get('/sites/' + id).then(function(res){
			return res.data;
		});
	};
	o.create = function(site){
		console.log ('Authorization: \'Bearer ' + auth.getToken());
		return $http.post('/sites', site, {
			headers: {
				Authorization: 'Bearer ' + auth.getToken()
			}
		}).success(function(data){
			o.sites.push(data);
		});
	};
	o.createReview = function(id, review){
		return $http.post('/sites/' + id + '/reviews', review, {
			headers: {
				Authorization: 'Bearer ' + auth.getToken()
			}
		});
	};
	o.upvote = function(site){
		return $http.put('/sites/' + site._id + '/upvote', null, {
			headers: {
				Authorization: 'Bearer ' + auth.getToken()
			}
		}).success(function(data){
			site.upVotes += 1;
		});
	};
	o.downvote = function(site){
		return $http.put('/sites/' + site._id + '/downvote', null, {
			headers: {
				Authorization: 'Bearer ' + auth.getToken()
			}
		}).success(function(data){
			site.upVotes -= 1;
		})
	}
	o.upVoteReview = function(site, review){
		return $http.put('/sites/' + site._id + '/reviews/' + review._id + '/upvote', null, {
			headers: {
				Authorization: 'Bearer ' + auth.getToken()
			}
		}).success(function(data){
			review.upVotes += 1;
		})
	}
	o.downVoteReview = function(site, review){
		return $http.put('/sites/' + site._id + '/reviews/' + review._id + '/downvote', null, {
			headers: {
				Authorization: 'Bearer ' + auth.getToken()
			}
		}).success(function(data){
			review.upVotes -= 1;
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
    'userFact',
    'thisUser',
    function($scope, $state, userFact, thisUser){
        $scope.thisUser = thisUser;
}]);

app.controller('PostCtrl', [
	'$scope',
	'siteFact',
	'site',
	'auth',
	function($scope, siteFact, site, auth){
		$scope.site = site;
		$scope.isLoggedIn = auth.isLoggedIn;
        $scope.checkUserRole = auth.checkUserRole;
		$scope.addReview = function(){
			if (!$scope.body || $scope.body === ''){
				return;
			}
			siteFact.createReview(site._id, {
				body: $scope.body,
				createdBy: 'user'
			}).success(function(review){
				$scope.site.reviews.push(review);
			});
			$scope.body = '';
		};
		$scope.incrementUpvotes = function(site){
			siteFact.upvote(site);
		};
		$scope.decrementUpvotes = function(site){
			siteFact.downvote(site);
		};
		$scope.incrementReviewvotes = function(site, review){
			siteFact.upVoteReview(site, review);
		};
		$scope.decrementReviewvotes = function(site, review){
			siteFact.downVoteReview(site, review);
		};
	}]);

app.controller('MainCtrl', [
'$scope',
'siteFact',
'auth',
function($scope, siteFact, auth){
	$scope.sites = siteFact.sites;
	$scope.currentPage = 1;
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.incrementUpvotes = function(site){
		siteFact.upvote(site);
	};
	$scope.decrementUpvotes = function(site){
		siteFact.downvote(site);
	};
}]);

app.controller('SubmitCtrl', [
'$scope',
'$state',
'siteFact',
function($scope, $state, siteFact){
	$scope.addSite = function(){
		if (!$scope.title || $scope.title === ''){
			return;
		}
		siteFact.create({
			name: $scope.name,
			url: $scope.url,
			description: $scope.description,
			createDate: new Date(),
		});
		$scope.name = '';
		$scope.description = '';
		$scope.url = '';
		$state.go('home', {});
	};
}]);