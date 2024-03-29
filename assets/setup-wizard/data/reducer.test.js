/**
 * Internal dependencies
 */
import {
	START_FETCH_SETUP_WIZARD_DATA,
	SUCCESS_FETCH_SETUP_WIZARD_DATA,
	ERROR_FETCH_SETUP_WIZARD_DATA,
	START_SUBMIT_SETUP_WIZARD_DATA,
	SUCCESS_SUBMIT_SETUP_WIZARD_DATA,
	ERROR_SUBMIT_SETUP_WIZARD_DATA,
	SET_DATA,
} from './constants';
import reducer from './reducer';

describe( 'Setup wizard reducer', () => {
	it( 'Should set isFetching to true on START_FETCH_SETUP_WIZARD_DATA action', () => {
		const state = reducer( undefined, {
			type: START_FETCH_SETUP_WIZARD_DATA,
		} );

		expect( state.isFetching ).toBeTruthy();
	} );

	it( 'Should set data and set states to false on SUCCESS_FETCH_SETUP_WIZARD_DATA action', () => {
		const data = { a: 1 };
		const state = reducer(
			{
				isFetching: true,
			},
			{
				type: SUCCESS_FETCH_SETUP_WIZARD_DATA,
				data,
			}
		);

		const expectedState = {
			isFetching: false,
			data,
		};
		expect( state ).toEqual( expectedState );
	} );

	it( 'Should set error on ERROR_FETCH_SETUP_WIZARD_DATA action', () => {
		const error = { msg: 'Error' };
		const state = reducer(
			{
				isFetching: true,
			},
			{
				type: ERROR_FETCH_SETUP_WIZARD_DATA,
				error,
			}
		);

		expect( state.isFetching ).toBeFalsy();
		expect( state.fetchError ).toEqual( error );
	} );

	it( 'Should set isSubmitting to true on START_SUBMIT_SETUP_WIZARD_DATA action', () => {
		const state = reducer(
			{
				isSubmitting: false,
				submitError: { msg: 'Error' },
			},
			{
				type: START_SUBMIT_SETUP_WIZARD_DATA,
				step: 'step',
				stepData: { selected: [ 'slug-1' ] },
			}
		);

		expect( state.isSubmitting ).toBeTruthy();
		expect( state.submitError ).toBeFalsy();
	} );

	it( 'Should set isSubmitting to false on SUCCESS_SUBMIT_SETUP_WIZARD_DATA action', () => {
		const state = reducer(
			{ isSubmitting: true },
			{
				type: SUCCESS_SUBMIT_SETUP_WIZARD_DATA,
				step: 'test',
			}
		);

		expect( state.isSubmitting ).toBeFalsy();
	} );

	it( 'Should set error on ERROR_SUBMIT_SETUP_WIZARD_DATA action', () => {
		const error = { msg: 'Error' };
		const state = reducer(
			{
				isSubmitting: true,
			},
			{
				type: ERROR_SUBMIT_SETUP_WIZARD_DATA,
				error,
			}
		);

		expect( state.isSubmitting ).toBeFalsy();
		expect( state.submitError ).toEqual( error );
	} );

	it( 'Should set the step data on SET_DATA action', () => {
		const data = { tracking: { usage_tracking: true } };
		const state = reducer( undefined, {
			type: SET_DATA,
			data,
		} );

		expect( state.data.tracking ).toEqual( data.tracking );
	} );

	it( 'Should set the step data on SET_DATA action, removing item from array', () => {
		const data = { features: { selected: [ 1, 3 ] } };
		const state = reducer(
			{ features: { selected: [ 1, 2 ] } },
			{
				type: SET_DATA,
				data,
			}
		);

		expect( state.data.features ).toEqual( data.features );
	} );

	it( 'Should return the current state for unknown types', () => {
		const currentState = { x: 1 };
		const state = reducer( currentState, {
			type: 'UNKNOWN',
		} );

		expect( state ).toEqual( currentState );
	} );
} );
