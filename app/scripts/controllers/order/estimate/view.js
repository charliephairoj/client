
angular.module('employeeApp')
.controller('OrderEstimateViewCtrl', ['$scope', 'Estimate', '$location', '$filter', 'KeyboardNavigation', '$mdToast',
function ($scope, Estimate, $location, $filter, KeyboardNavigation, $mdToast) {
	
	
	/*
	 * Vars
	 * 
	 * -fetching: this is a switch to see if there is currently a call being made
	 */
	var fetching = true,
		index = 0,
		currentSelection;
		
	var loadingToast = $mdToast.show($mdToast
			.simple()
			.position('top right')
			.content('Loading estimates...')
			.hideDelay(0));

	//Poll the server for acknowledgements
	$scope.estimates = Estimate.query({limit: 20}, function (e) {
		$mdToast.hide();
		fetching = false;
		changeSelection(index);
	});

	/*
	 * Take the query in the searchbar and then sends 
	 * the query to the server to get more results. The
	 * resuls are then integrated with the current list of
	 * resources;
	 */
	$scope.$watch('query.$.$', function (q) {
		
		if (q) {
			Estimate.query({q: q, limit: q ? q.length : 5}, function (resources) {
				for (var i = 0; i < resources.length; i++) {
					if ($scope.estimates.indexOfById(resources[i].id) == -1) {
						$scope.estimates.push(resources[i]);
					}
				}
				index = 0;
				changeSelection(index);
				
			});
		}
	});

	//Loads the next set of data
	$scope.loadNext = function () {
		if (!fetching) {
			fetching = true;
			var moreAckToast = $mdToast.show($mdToast
					.simple()
					.position('top right')
					.hideDelay(0)
					.content('Loading more acknowledgements...'));
			Estimate.query({
				limit: 50, 
				offset: $scope.estimates.length
			}, function (resources) {
				fetching = false;
				$mdToast.hide();
				for (var i = 0; i < resources.length; i++) {
					$scope.estimates.push(resources[i]);
				}
			});
		}
	};
	
	function filter(array) {
		return $filter('filter')(array, $scope.query);
	}
			
	function changeSelection(i) {
				
		$scope.safeApply(function () {
			if (currentSelection) {
				currentSelection.$selected = false;
			}
			
			currentSelection = filter($scope.estimates)[i];
			
			if (currentSelection) {
				currentSelection.$selected = true;
			}
		});
	
		var selection = $('.item.selected');
		var container = selection.parents('.outer-container');
		var scrollTop = container.scrollTop();
		var cHeight = container.innerHeight();
		
		
		if (scrollTop > (selection.outerHeight() * i)) {
			container.scrollTop(selection.outerHeight() * i);
		} else if ((scrollTop + cHeight) < (selection.outerHeight() * i)) {
			container.scrollTop(selection.outerHeight() * i);
		}
				
	}
	
	var keyboardNav = new KeyboardNavigation();
			
	keyboardNav.ondown = function () {
		if (index < filter($scope.estimates).length - 1) {
			index += 1;
			changeSelection(index);
		}
	};
	
	keyboardNav.onup = function () {
		if (index !== 0) {
			index -= 1;
			changeSelection(index);
		}
	};
	
	keyboardNav.onenter = function () {
		$scope.safeApply(function () {
			$location.path('/order/acknowledgement/' + currentSelection.id);
		});
	};
	
	keyboardNav.enable();
	
	$scope.$on('$destroy', function () {
		keyboardNav.disable();
	});
	
}]);