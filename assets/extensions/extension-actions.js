/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/icons';
import { useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { checked } from '../icons/wordpress-icons';
import { EXTENSIONS_STORE } from './store';
import { UpdateIcon } from '../icons';

/**
 * Extension actions component.
 *
 * @param {Object} props         Component props.
 * @param {Array}  props.actions Actions array containing objects with props for link or button.
 */
const ExtensionActions = ( { actions } ) => (
	<ul className="sensei-extensions__extension-actions">
		{ actions.map( ( { key, children, ...actionProps } ) => {
			const ActionComponent = actionProps.href ? 'a' : 'button';

			return (
				<li
					key={ key }
					className="sensei-extensions__extension-actions__item"
				>
					<ActionComponent
						className={
							actionProps.className || 'button button-primary'
						}
						{ ...actionProps }
					>
						{ children }
					</ActionComponent>
				</li>
			);
		} ) }
	</ul>
);

export default ExtensionActions;

/**
 * Extension actions hook.
 *
 * @param {Object} extension Extension object.
 *
 * @return {Array|null} Array of actions, or null if it's not a valid extension.
 */
export const useExtensionActions = ( extension ) => {
	const { updateExtensions } = useDispatch( EXTENSIONS_STORE );

	if ( ! extension.product_slug ) {
		return null;
	}

	let buttonLabel = '';
	let buttonAction = () => {};

	if ( 'in-progress' === extension.status ) {
		buttonLabel = (
			<>
				<UpdateIcon
					width="20"
					height="20"
					className="sensei-extensions__rotating-icon sensei-extensions__extension-actions__button-icon"
				/>
				{ __( 'Updating…', 'sensei-lms' ) }
			</>
		);
	} else if ( extension.canUpdate ) {
		buttonLabel = __( 'Update', 'sensei-lms' );
		buttonAction = () =>
			updateExtensions( [ extension ], extension.product_slug );
	} else if ( extension.is_installed ) {
		buttonLabel = (
			<>
				<Icon
					className="sensei-extensions__extension-actions__button-icon"
					icon={ checked }
					size={ 14 }
				/>{ ' ' }
				{ __( 'Installed', 'sensei-lms' ) }
			</>
		);
	} else {
		buttonLabel = `${ __( 'Install', 'sensei-lms' ) } - ${
			extension.price !== '0'
				? extension.price
				: __( 'Free', 'sensei-lms' )
		}`;
	}

	let buttons = [
		{
			key: 'main-button',
			disabled:
				'in-progress' === extension.status ||
				( extension.is_installed && ! extension.canUpdate ),
			children: buttonLabel,
			onClick: buttonAction,
		},
	];

	if ( extension.link ) {
		buttons = [
			...buttons,
			{
				key: 'more-details',
				href: extension.link,
				className: 'sensei-extensions__extension-actions__details-link',
				target: '_blank',
				rel: 'noreferrer external',
				children: __( 'More details', 'sensei-lms' ),
			},
		];
	}

	return buttons;
};
