<?php

namespace SenseiTest\WPML;

use Sensei_Factory;
use Sensei_WPML;

/**
* Class Sensei_WPML_Test.
*
* @covers \Sensei_WPML
*/
class Sensei_WPML_Test extends \WP_UnitTestCase {

	/**
	 * Sensei Factory.
	 *
	 * @var Sensei_Factory
	 */
	protected $factory;

	public function set_up(): void {
		parent::set_up();
		$this->factory = new Sensei_Factory();
	}

	public function tear_down(): void {
		parent::tear_down();
		$this->factory->tearDown();
	}

	public function testSetLanguageDetailsWhenLessonCreated_WhenCalled_AppliesWpmlElementLanguageCodeFilter() {
		/* Arrange. */
		$wpml = new Sensei_WPML();

		$filter_applied  = false;
		$filter_function = function( $language_code, $element_data ) use ( &$filter_applied ) {
			$filter_applied = true;
			return $language_code;
		};

		add_filter( 'wpml_element_language_code', $filter_function, 10, 2 );

		/* Act. */
		$wpml->set_language_details_when_lesson_created( 1, 2 );

		/* Clean up & Assert. */
		remove_filter( 'wpml_element_language_code', $filter_function, 10 );

		$this->assertTrue( $filter_applied );
	}

	public function testSetLanguageDetailsWhenLessonCreated_WhenCalled_AppliesWpmlCurrentLangugeFilter() {
		/* Arrange. */
		$wpml = new Sensei_WPML();

		$filter_language_code_function = function( $language_code, $element_data ) use ( &$filter_applied ) {
			return null;
		};
		add_filter( 'wpml_element_language_code', $filter_language_code_function, 10, 2 );

		$filter_applied  = false;
		$filter_function = function( $language_code ) use ( &$filter_applied ) {
			$filter_applied = true;
			return $language_code;
		};
		add_filter( 'wpml_current_language', $filter_function, 10, 1 );

		/* Act. */
		$wpml->set_language_details_when_lesson_created( 1, 2 );

		/* Clean up & Assert. */
		remove_filter( 'wpml_element_language_code', $filter_language_code_function, 10 );
		remove_filter( 'wpml_current_language', $filter_function, 10 );

		$this->assertTrue( $filter_applied );
	}

	public function testSetLanguageDetailsWhenLessonCreated_WhenCalled_AppliesWpmlSetElementLanguageDetails() {
		/* Arrange. */
		$wpml = new Sensei_WPML();

		$filter_applied  = false;
		$filter_function = function( $data ) use ( &$filter_applied ) {
			$filter_applied = true;
			return $data;
		};

		add_filter( 'wpml_set_element_language_details', $filter_function, 10, 1 );

		/* Act. */
		$wpml->set_language_details_when_lesson_created( 1, 2 );

		/* Clean up & Assert. */
		remove_filter( 'wpml_set_element_language_details', $filter_function, 10 );

		$this->assertTrue( $filter_applied );
	}

	public function testSetLanguageDetailsWhenQuizCreated_WhenCalled_AppliesWpmlElementLanguageCodeFilter() {
		/* Arrange. */
		$wpml = new Sensei_WPML();

		$filter_applied  = false;
		$filter_function = function( $language_code, $element_data ) use ( &$filter_applied ) {
			$filter_applied = true;
			return $language_code;
		};

		add_filter( 'wpml_element_language_code', $filter_function, 10, 2 );

		/* Act. */
		$wpml->set_language_details_when_quiz_created( 1, 2 );

		/* Clean up & Assert. */
		remove_filter( 'wpml_element_language_code', $filter_function, 10 );

		$this->assertTrue( $filter_applied );
	}

	public function testSetLanguageDetailsWhenQuizCreated_WhenCalled_AppliesWpmlCurrentLangugeFilter() {
		/* Arrange. */
		$wpml = new Sensei_WPML();

		$filter_language_code_function = function( $language_code, $element_data ) use ( &$filter_applied ) {
			return null;
		};
		add_filter( 'wpml_element_language_code', $filter_language_code_function, 10, 2 );

		$filter_applied  = false;
		$filter_function = function( $language_code ) use ( &$filter_applied ) {
			$filter_applied = true;
			return $language_code;
		};
		add_filter( 'wpml_current_language', $filter_function, 10, 1 );

		/* Act. */
		$wpml->set_language_details_when_quiz_created( 1, 2 );

		/* Clean up & Assert. */
		remove_filter( 'wpml_element_language_code', $filter_language_code_function, 10 );
		remove_filter( 'wpml_current_language', $filter_function, 10 );

		$this->assertTrue( $filter_applied );
	}

	public function testSetLanguageDetailsWhenQuizCreated_WhenCalled_AppliesWpmlSetElementLanguageDetails() {
		/* Arrange. */
		$wpml = new Sensei_WPML();

		$filter_applied  = false;
		$filter_function = function( $data ) use ( &$filter_applied ) {
			$filter_applied = true;
			return $data;
		};

		add_filter( 'wpml_set_element_language_details', $filter_function, 10, 1 );

		/* Act. */
		$wpml->set_language_details_when_quiz_created( 1, 2 );

		/* Clean up & Assert. */
		remove_filter( 'wpml_set_element_language_details', $filter_function, 10 );

		$this->assertTrue( $filter_applied );
	}

	public function testUpdateCoursePrerequisiteBeforeCopied_WhenCalled_ReturnsMatchingPrerequisiteForNewCourse() {
		/* Arrange. */
		$wpml = new Sensei_WPML();

		$language_code_filter = function( $language_code, $element_data ) {
			return 'a';
		};
		add_filter( 'wpml_element_language_code', $language_code_filter, 10, 2 );

		$object_id_fitler = function( $object_id, $element_type, $return_original_if_missing, $args ) {
			return 4;
		};
		add_filter( 'wpml_object_id', $object_id_fitler, 10, 4 );

		/* Act. */
		$actual = $wpml->update_course_prerequisite_before_copied( 1, 2, 3, '_course_prerequisite' );

		/* Clean up & Assert. */
		remove_filter( 'wpml_element_language_code', $language_code_filter );
		remove_filter( 'wpml_object_id', $object_id_fitler );
		$this->assertSame( 4, $actual );
	}

	public function testUpdateLessonCourseBeforeCopied_WhenCalled_ReturnsMatchingCourseForNewLesson() {
		/* Arrange. */
		$wpml = new Sensei_WPML();

		$language_code_filter = function( $language_code, $element_data ) {
			return 'a';
		};
		add_filter( 'wpml_element_language_code', $language_code_filter, 10, 2 );

		$object_id_fitler = function( $object_id, $element_type, $return_original_if_missing, $args ) {
			return 4;
		};
		add_filter( 'wpml_object_id', $object_id_fitler, 10, 4 );

		/* Act. */
		$actual = $wpml->update_lesson_course_before_copied( 1, 2, 3, '_lesson_course' );

		/* Clean up & Assert. */
		remove_filter( 'wpml_element_language_code', $language_code_filter );
		remove_filter( 'wpml_object_id', $object_id_fitler );

		$this->assertSame( 4, $actual );
	}

	public function testUpdateLessonPropertiesOnCourseTranslationCreated_WhenCalled_CreatesLessonTranslations() {
		/* Arrange. */
		$new_course_id = $this->factory->course->create();
		$old_course    = $this->factory->get_course_with_lessons( array( 'lesson_count' => 2 ) );

		$wpml = new Sensei_WPML();

		$element_language_details_filter = function( $element_object, $args ) {
			return array(
				'language_code'        => 'a',
				'source_language_code' => 'c',
			);
		};
		add_filter( 'wpml_element_language_details', $element_language_details_filter, 10, 2 );

		$object_id_fitler = function( $object_id, $element_type, $return_original_if_missing, $args ) use ( $new_course_id, $old_course ) {
			if ( $new_course_id === $object_id && 'course' === $element_type ) {
				return $old_course['course_id'];
			}

			return 4;
		};
		add_filter( 'wpml_object_id', $object_id_fitler, 10, 4 );

		$element_has_translations_filter = function( $has_translations, $element_id, $element_type ) {
			return false;
		};
		add_filter( 'wpml_element_has_translations', $element_has_translations_filter, 10, 3 );

		$created_lessons                  = 0;
		$admin_make_post_duplicates_acton = function( $post_id ) use ( &$created_lessons ) {
			$created_lessons++;
		};
		add_action( 'wpml_admin_make_post_duplicates', $admin_make_post_duplicates_acton, 10, 1 );

		$post_duplicates_filter = function( $post_id ) {
			return array( 'a' => 1 );
		};
		add_filter( 'wpml_post_duplicates', $post_duplicates_filter, 10, 1 );

		/* Act. */
		$wpml->update_lesson_properties_on_course_translation_created( $new_course_id );

		/* Clean up & Assert. */
		remove_filter( 'wpml_element_language_details', $element_language_details_filter );
		remove_filter( 'wpml_object_id', $object_id_fitler );
		remove_filter( 'wpml_element_has_translations', $element_has_translations_filter );
		remove_action( 'wpml_admin_make_post_duplicates', $admin_make_post_duplicates_acton );

		$this->assertSame( 2, $created_lessons );

	}
}
