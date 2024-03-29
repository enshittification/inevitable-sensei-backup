/**
 * Internal dependencies
 */
import {
	API_BASE_PATH,
	START_FETCH_SETUP_WIZARD_DATA,
	SUCCESS_FETCH_SETUP_WIZARD_DATA,
	ERROR_FETCH_SETUP_WIZARD_DATA,
	START_SUBMIT_SETUP_WIZARD_DATA,
	SUCCESS_SUBMIT_SETUP_WIZARD_DATA,
	ERROR_SUBMIT_SETUP_WIZARD_DATA,
	SET_DATA,
} from './constants';
import {
	fetchSetupWizardData,
	startFetch,
	successFetch,
	errorFetch,
	startSubmit,
	successSubmit,
	errorSubmit,
	submitStep,
	setData,
} from './actions';

describe( 'Setup wizard actions', () => {
	it( 'Should generate the fetch setup wizard data action', () => {
		const gen = fetchSetupWizardData();

		// Start fetch action.
		const expectedStartFetchAction = {
			type: START_FETCH_SETUP_WIZARD_DATA,
		};
		expect( gen.next().value ).toEqual( expectedStartFetchAction );

		// Fetch action.
		const expectedFetchAction = {
			type: 'API_FETCH',
			request: {
				path: '/sensei-internal/v1/setup-wizard',
			},
		};
		expect( gen.next().value ).toEqual( expectedFetchAction );

		// Set data action.
		const dataObject = {
			features: {
				options: [
					{
						product_slug: 'test',
						title: 'Test',
					},
				],
			},
		};
		const expectedSetDataAction = {
			type: SUCCESS_FETCH_SETUP_WIZARD_DATA,
			data: dataObject,
		};
		expect( gen.next( dataObject ).value ).toEqual( expectedSetDataAction );
	} );

	it( 'Should catch error on the fetch setup wizard data action', () => {
		const gen = fetchSetupWizardData();

		// Start fetch action.
		gen.next();

		// Fetch action.
		gen.next();

		// Error action.
		const error = { msg: 'Error' };
		const expectedErrorAction = {
			type: ERROR_FETCH_SETUP_WIZARD_DATA,
			error,
		};
		expect( gen.throw( error ).value ).toEqual( expectedErrorAction );
	} );

	it( 'Should return the start fetch setup wizard data action', () => {
		const expectedAction = {
			type: START_FETCH_SETUP_WIZARD_DATA,
		};

		expect( startFetch() ).toEqual( expectedAction );
	} );

	it( 'Should return the success fetch action', () => {
		const data = { x: 1 };
		const expectedAction = {
			type: SUCCESS_FETCH_SETUP_WIZARD_DATA,
			data,
		};

		expect( successFetch( data ) ).toEqual( expectedAction );
	} );

	it( 'Should return the error fetch action', () => {
		const error = { err: 'Error' };
		const expectedAction = {
			type: ERROR_FETCH_SETUP_WIZARD_DATA,
			error,
		};

		expect( errorFetch( error ) ).toEqual( expectedAction );
	} );

	it( 'Should return the start submit action', () => {
		const expectedAction = {
			type: START_SUBMIT_SETUP_WIZARD_DATA,
		};

		expect( startSubmit() ).toEqual( expectedAction );
	} );

	it( 'Should return the success submit action', () => {
		const expectedAction = {
			type: SUCCESS_SUBMIT_SETUP_WIZARD_DATA,
		};

		expect( successSubmit() ).toEqual( expectedAction );
	} );

	it( 'Should return the error submit action', () => {
		const error = { err: 'Error' };
		const expectedAction = {
			type: ERROR_SUBMIT_SETUP_WIZARD_DATA,
			error,
		};

		expect( errorSubmit( error ) ).toEqual( expectedAction );
	} );

	it( 'Should generate the submit step action', () => {
		const onSuccessMock = jest.fn();
		const onErrorMock = jest.fn();
		const options = {
			onSuccess: onSuccessMock,
			onError: onErrorMock,
		};

		const step = 'welcome';
		const stepData = { usage_tracking: true };
		const gen = submitStep( step, stepData, options );

		// Start submit action.
		const expectedStartSubmitAction = {
			type: START_SUBMIT_SETUP_WIZARD_DATA,
		};
		expect( gen.next().value ).toEqual( expectedStartSubmitAction );

		// Submit action.
		const expectedSubmitAction = {
			type: 'API_FETCH',
			request: {
				path: API_BASE_PATH + step,
				method: 'POST',
				data: {
					usage_tracking: true,
				},
			},
		};
		expect( gen.next().value ).toEqual( expectedSubmitAction );

		// Success action.
		const expectedSuccessAction = {
			type: SUCCESS_SUBMIT_SETUP_WIZARD_DATA,
		};
		expect( gen.next().value ).toEqual( expectedSuccessAction );

		// Set data action.
		const expectedSetDataAction = {
			type: SET_DATA,
			data: { usage_tracking: true },
		};

		expect( gen.next().value ).toEqual( expectedSetDataAction );

		// Continue to callback.
		gen.next();

		expect( onSuccessMock ).toBeCalled();
		expect( onErrorMock ).not.toBeCalled();
	} );

	it( 'Should catch error on the submit step action', () => {
		const onSuccessMock = jest.fn();
		const onErrorMock = jest.fn();
		const options = {
			onSuccess: onSuccessMock,
			onError: onErrorMock,
		};

		const gen = submitStep( 'test', true, options );

		// Start submit action.
		gen.next();

		// Fetch action.
		gen.next();

		// Error action.
		const error = { msg: 'Error' };
		const expectedErrorAction = {
			type: ERROR_SUBMIT_SETUP_WIZARD_DATA,
			error,
		};
		expect( gen.throw( error ).value ).toEqual( expectedErrorAction );

		// Continue to callback.
		gen.next();

		expect( onSuccessMock ).not.toBeCalled();
		expect( onErrorMock ).toBeCalled();
	} );

	it( 'Should return the set data action', () => {
		const data = { tracking: { usage_tracking: true } };
		const expectedAction = {
			type: SET_DATA,
			data,
		};

		expect( setData( data ) ).toEqual( expectedAction );
	} );
} );
