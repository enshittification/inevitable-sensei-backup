/**
 * External dependencies
 */
import { render } from '@testing-library/react';

/**
 * Internal dependencies
 */
import FirstCourse from './first-course';

describe( '<FirstCourse />', () => {
	it( 'Should render the first course with all details', () => {
		const { container, queryByText } = render(
			<FirstCourse
				siteTitle="SITE_TITLE"
				siteImage="SITE_IMAGE"
				courseTitle="COURSE_TITLE"
				courseImage="COURSE_IMAGE"
			/>
		);

		const siteImage = container
			.querySelector( '.sensei-home-first-course__site-logo' )
			.getAttribute( 'src' );

		const courseImage = container.querySelector(
			'.sensei-home-first-course__featured-image'
		).style.backgroundImage;

		expect( queryByText( 'SITE_TITLE' ) ).toBeTruthy();
		expect( queryByText( 'COURSE_TITLE' ) ).toBeTruthy();
		expect( siteImage ).toEqual( 'SITE_IMAGE' );
		expect( courseImage ).toEqual( `url(COURSE_IMAGE)` );
	} );

	it( 'Should render the first course with placeholders', () => {
		const { container } = render( <FirstCourse /> );

		const siteTitlePlaceholder = container.querySelector(
			'.sensei-home-first-course__site-title-placeholder'
		);
		const courseTitlePlaceholder = container.querySelector(
			'.sensei-home-first-course__course-title-placeholder'
		);

		const siteImage = container.querySelector(
			'.sensei-home-first-course__site-logo'
		);
		const courseImage = container.querySelector(
			'.sensei-home-first-course__featured-image'
		).style.backgroundImage;

		expect( siteTitlePlaceholder ).toBeTruthy();
		expect( courseTitlePlaceholder ).toBeTruthy();
		expect( siteImage ).toBeFalsy();
		expect( courseImage ).toEqual( '' );
	} );
} );
