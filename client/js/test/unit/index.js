describe('Testing Angular JS - Crossover Video', function() {
	beforeEach(module('myApp'));
	
	describe('Testing Angular JS Controller', function() {
		var scope, ctrl;
		
		beforeEach(inject(function($controller, $rootScope){
			scope = $rootScope.$new();
			ctrl = $controller('AppCtrl', { $scope: scope })
		}) );
		
		afterEach(function() {
			// clean up code
		});
		
		// form sign in
		it('should initialize form info login', function() {
			expect(scope.form_info).toBeDefined();
			expect(scope.form_info).toBe('');
			expect(scope.users).toBeDefined();
			expect(scope.users).toEqual({});
		});
		
		// video
		it('should initialize video', function() {
			expect(scope.video).toBeDefined();
			expect(scope.video).toEqual({});
			expect(scope.array_video).toBeDefined();
			expect(scope.array_video).toEqual([]);
		});
		
		// rate
		it('should initialize rate', function() {
			var rateOption = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
			var selectOption = rateOption[0];
		
			expect(scope.rateOption).toBeDefined();
			expect(scope.rateOption).toEqual(rateOption);
			expect(scope.selectOption).toBeDefined();
			expect(scope.selectOption).toEqual(selectOption);
		});
	});
});
