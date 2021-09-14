/**
 * WordPress dependencies
 */
import { BlockControls, InnerBlocks } from '@wordpress/block-editor';
import { select, useDispatch } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { compose } from '@wordpress/compose';
import { __, _n, sprintf } from '@wordpress/i18n';
/**
 * External dependencies
 */
import cn from 'classnames';

/**
 * Internal dependencies
 */

import { withBlockValidation } from '../../../shared/blocks/block-validation';
import { useQuestionNumber } from '../question-number';
import SingleLineInput from '../../../shared/blocks/single-line-input';
import { withBlockMeta } from '../../../shared/blocks/block-metadata';
import { useHasSelected } from '../../../shared/helpers/blocks';
import types from '../answer-blocks';
import {
	QuestionValidationNotice,
	SharedQuestionNotice,
} from './question-block-helpers';
import { QuestionGradeToolbar } from './question-grade-toolbar';
import {
	validateQuestionBlock,
	getQuestionBlockValidationErrorMessages,
} from './question-validation';
import QuestionView from './question-view';
import QuestionSettings from './question-settings';
import { QuestionTypeToolbar } from './question-type-toolbar';
import SingleQuestion from './single-question';
import QuestionAppender from './question-appender'
import QuestionDescription from '../question-description-block/question-description'
import QuestionDescriptionIcon from '../../../icons/question-description-icon';
import AnswerFeedbackCorrect from '../answer-feedback-correct-block/answer-feedback-correct'
import AnswerFeedbackCorrectIcon from '../../../icons/answer-feedback-correct';
import AnswerFeedbackFailed from '../answer-feedback-failed-block/answer-feedback-failed'
import AnswerFeedbackFailedIcon from '../../../icons/answer-feedback-failed';

/**
 * Format the question grade as `X points`.
 *
 * @param {number} grade Question grade.
 * @return {string} Grade text.
 */
const formatGradeLabel = ( grade ) =>
	// Translators: placeholder is the grade for the questions.
	sprintf( _n( '%d point', '%d points', grade, 'sensei-lms' ), grade );

/**
 * Quiz question block editor.
 *
 * @param {Object}   props
 * @param {Object}   props.attributes       Block attributes.
 * @param {Object}   props.attributes.title Question title.
 * @param {Function} props.setAttributes    Set block attributes.
 */
const QuestionEdit = ( props ) => {
	const {
		attributes: {
			title,
			type,
			answer = {},
			options,
			shared,
			editable = true,
		},
		setAttributes,
		clientId,
		context,
	} = props;
	const { removeBlock, selectBlock } = useDispatch( 'core/block-editor' );

	const selectDescription = useCallback( () => {
		const innerBlocks = select( 'core/block-editor' ).getBlocks( clientId );
		if ( innerBlocks.length ) {
			selectBlock( innerBlocks[ 0 ].clientId );
		}
	}, [ clientId, selectBlock ] );

	const questionNumber = useQuestionNumber( clientId );
	const AnswerBlock = type && types[ type ];

	// Filter the Allowed Blocks for the render Appender to use based on answerBlock type.
	if (
		'boolean' == type
		|| 'gap-fill' == type
		|| 'multiple-choice' == type
	) {
		var ALLOWED_BLOCKS = [
			'sensei-lms/question-description',
			'sensei-lms/answer-feedback-correct',
			'sensei-lms/answer-feedback-failed',
		];
		var ALLOWED_BLOCKS_EXTENDED = [
			{
				name: 'sensei-lms/question-description',
				title: 'Question Description',
				icon: QuestionDescriptionIcon,
				block: QuestionDescription,
			},
			{
				name: 'sensei-lms/answer-feedback-correct',
				title: 'Correct Answer Feedback',
				icon: AnswerFeedbackCorrectIcon,
				block: AnswerFeedbackCorrect,
			},
			{
				name: 'sensei-lms/answer-feedback-failed',
				title: 'Failed Answer Feedback',
				icon: AnswerFeedbackFailedIcon,
				block: AnswerFeedbackFailed,
			},
		];
	} else {
		var ALLOWED_BLOCKS = [
			'sensei-lms/question-description',
		];
		var ALLOWED_BLOCKS_EXTENDED = [
			{
				name: 'sensei-lms/question-description',
				title: 'Question Description',
				icon: QuestionDescriptionIcon,
				block: QuestionDescription,
			},
		];
	}

	const hasSelected = useHasSelected( props );
	const isSingle = context && ! ( 'sensei-lms/quizId' in context );
	const showContent = title || hasSelected || isSingle;

	const questionIndex = ! isSingle && (
		<h2 className="sensei-lms-question-block__index">
			{ questionNumber }.
		</h2>
	);

	const isInvalid =
		props.meta.showValidationErrors && props.meta.validationErrors?.length;

	const questionGrade = (
		<div className="sensei-lms-question-block__grade">
			{ formatGradeLabel( options.grade ) }
		</div>
	);

	const AppenderComponent = () => {
		const innerBlocks = select( 'core/block-editor' ).getBlock( clientId ).innerBlocks
		const insertableBlocks = [];

		ALLOWED_BLOCKS_EXTENDED.map( ( allowedBlock ) => {
			if ( innerBlocks.map( theBlock => theBlock.name ).indexOf( allowedBlock.name ) === -1 ) {
				insertableBlocks.push ( allowedBlock );
			}
		});

		return (
			<QuestionAppender
				clientId={ clientId }
				insertableBlocks={ insertableBlocks }
			/>
		);
	};

	if ( ! editable ) {
		return (
			<QuestionView
				{ ...props }
				{ ...{ questionGrade, questionIndex, AnswerBlock } }
			/>
		);
	}

	return (
		<div
			className={ cn( 'sensei-lms-question-block', {
				'is-draft': ! title,
				'is-invalid': isInvalid,
			} ) }
		>
			{ questionIndex }
			{ isSingle && <SingleQuestion { ...props } /> }
			<h2 className="sensei-lms-question-block__title">
				<SingleLineInput
					placeholder={ __( 'Question Title', 'sensei-lms' ) }
					value={ title }
					onChange={ ( nextValue ) =>
						setAttributes( { title: nextValue } )
					}
					onEnter={ selectDescription }
					onRemove={ () => removeBlock( clientId ) }
				/>
			</h2>
			{ showContent && questionGrade }
			{ hasSelected && shared && <SharedQuestionNotice /> }
			{ showContent && (
				<>
					<InnerBlocks
						allowedBlocks={ ALLOWED_BLOCKS }
						renderAppender={ AppenderComponent }
						template={ [
							[
								'sensei-lms/question-description', {},
								[
									[
										'core/paragraph',
										{
											placeholder: __(
												'Question Description',
												'sensei-lms'
											),
										},
									],
								],
							],
						] }
						templateInsertUpdatesSelection={ false }
						templateLock={ false }
					/>
					{ AnswerBlock?.edit && (
						<>
							<AnswerBlock.edit
								attributes={ answer }
								setAttributes={ ( next ) =>
									setAttributes( {
										answer: { ...answer, ...next },
									} )
								}
								hasSelected={ hasSelected }
							/>
						</>
					) }
				</>
			) }
			<QuestionValidationNotice
				{ ...props }
				getErrorMessages={ getQuestionBlockValidationErrorMessages }
			/>
			<BlockControls>
				<>
					<QuestionTypeToolbar
						value={ type }
						onSelect={ ( nextValue ) =>
							setAttributes( { type: nextValue } )
						}
					/>
					<QuestionGradeToolbar
						value={ options.grade }
						onChange={ ( nextGrade ) =>
							setAttributes( {
								options: { ...options, grade: nextGrade },
							} )
						}
					/>
				</>
			</BlockControls>
			<QuestionSettings controls={ AnswerBlock?.settings } { ...props } />
		</div>
	);
};

export default compose(
	withBlockMeta,
	withBlockValidation( validateQuestionBlock )
)( QuestionEdit );
