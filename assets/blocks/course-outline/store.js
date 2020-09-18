import { apiFetch, controls as dataControls } from '@wordpress/data-controls';
import { dispatch, registerStore, select, subscribe } from '@wordpress/data';
import { createReducerFromActionMap } from '../../shared/data/store-helpers';

const DEFAULT_STATE = {
	structure: [],
	editor: [],
	isSaving: false,
	isDirty: false,
};

const actions = {
	/**
	 * Fetch course structure data from REST API.
	 */
	*fetchCourseStructure() {
		const courseId = yield select( 'core/editor' ).getCurrentPostId();
		const result = yield apiFetch( {
			path: `/sensei-internal/v1/course-structure/${ courseId }`,
		} );
		yield actions.setStructure( result );
	},
	/**
	 * Persist editor's course structure to the REST API
	 */
	*save() {
		const { shouldSave, getEditorStructure } = select( COURSE_STORE );
		if ( ! ( yield shouldSave() ) ) return;

		yield { type: 'SAVING', isSaving: true };
		const courseId = yield select( 'core/editor' ).getCurrentPostId();
		try {
			const result = yield apiFetch( {
				path: `/sensei-internal/v1/course-structure/${ courseId }`,
				method: 'POST',
				data: { structure: yield getEditorStructure() },
			} );
			yield actions.setStructure( result );
		} catch ( error ) {
			yield dispatch( 'core/notices' ).createErrorNotice( error.message );
		}

		yield { type: 'SAVING', isSaving: false };
	},
	setStructure: ( structure ) => ( { type: 'SET_SERVER', structure } ),
	setEditorStructure: ( structure ) => ( { type: 'SET_EDITOR', structure } ),
};

/**
 * Course structure reducers.
 */
const reducers = {
	SET_SERVER: ( { structure }, state ) => ( {
		...state,
		structure,
		editor: structure,
		isDirty: false,
	} ),
	SET_EDITOR: ( { structure }, state ) => ( {
		...state,
		editor: structure,
		isDirty: true,
	} ),
	SAVING: ( { isSaving }, state ) => ( {
		...state,
		isSaving,
	} ),
	DEFAULT: ( action, state ) => state,
};

/**
 * Course structure resolvers.
 */
const resolvers = {
	getStructure: () => actions.fetchCourseStructure(),
};

/**
 * Course structure  selectors
 */
const selectors = {
	getStructure: ( { structure } ) => structure,
	getEditorStructure: ( { editor } ) => editor,
	shouldSave: ( { isDirty, isSaving } ) => isDirty && ! isSaving,
};

export const COURSE_STORE = 'sensei/course-structure';

/**
 * Register course structure store and subscribe to block editor save.
 */
const registerCourseStructureStore = () => {
	subscribe( () => {
		const editor = select( 'core/editor' );

		if ( ! editor ) return;

		if ( editor.isSavingPost() && ! editor.isAutosavingPost() ) {
			dispatch( COURSE_STORE ).save();
		}
	} );

	registerStore( COURSE_STORE, {
		reducer: createReducerFromActionMap( reducers, DEFAULT_STATE ),
		actions,
		selectors,
		resolvers,
		controls: { ...dataControls },
	} );
};

registerCourseStructureStore();