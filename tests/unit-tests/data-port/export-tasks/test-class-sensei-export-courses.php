<?php
/**
 * This file contains the Sensei_Export_Courses_Tests class.
 *
 * @package sensei
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use DMS\PHPUnitExtensions\ArraySubset\ArraySubsetAsserts;

/**
 * Tests for Sensei_Export_Courses class.
 *
 * @group data-port
 */
class Sensei_Export_Courses_Tests extends WP_UnitTestCase {
	use ArraySubsetAsserts;
	use Sensei_Export_Task_Tests;

	/**
	 * Factory helper.
	 *
	 * @var Sensei_Factory
	 */
	protected $factory;

	/**
	 * Setup function.
	 */
	public function setUp(): void {
		parent::setUp();

		if ( ! isset( Sensei()->admin ) ) {
			Sensei()->admin = new Sensei_Admin();
		}

		$this->factory = new Sensei_Factory();
	}

	/**
	 * Test that course categories are exported correctly.
	 */
	public function testCategoriesSerialized() {
		$course = $this->factory->course->create_and_get();

		$terms = [
			$this->factory->term->create(
				[
					'taxonomy' => 'course-category',
					'name'     => 'Course Category \'Single\'',
				]
			),
			$this->factory->term->create(
				[
					'taxonomy' => 'course-category',
					'name'     => 'Course Category "Double"',
				]
			),
		];
		$this->factory->term->add_post_terms( $course->ID, $terms, 'course-category', false );

		$result = $this->export();

		$this->assertEquals(
			'Course Category \'Single\',Course Category "Double"',
			$result[0]['categories']
		);
	}

	/**
	 * Tests lessons field is exported in the correct order.
	 */
	public function testLessonsSerializedInOrder() {
		$course_id = $this->factory->course->create();

		$course_lesson_args = [
			'meta_input' => [
				'_lesson_course' => $course_id,
			],
		];
		$lessons            = $this->factory->lesson->create_many( 3, $course_lesson_args );
		$lesson_unordered   = $this->factory->lesson->create( $course_lesson_args );

		// Rogue lesson.
		$this->factory->lesson->create();

		$lesson_order = [ $lessons[1], $lessons[0], $lessons[2] ];

		Sensei()->admin->save_lesson_order( implode( ',', $lesson_order ), $course_id );

		$result = $this->export();

		$lesson_order_str = "id:{$lesson_order[0]},id:{$lesson_order[1]},id:{$lesson_order[2]},id:{$lesson_unordered}";
		$this->assertEquals( $lesson_order_str, $result[0]['lessons'] );
	}

	/**
	 * Tests lessons field is exported in the correct order when the course has modules.
	 */
	public function testCourseWithModulesGeneratesCorrectOrder() {
		$module  = $this->factory->module->create_and_get();
		$lessons = $this->factory->lesson->create_many( 5 );
		$course  = $this->factory->course->create_and_get();

		wp_set_object_terms( $lessons[0], $module->term_id, 'module' );
		wp_set_object_terms( $lessons[1], $module->term_id, 'module' );
		wp_set_object_terms( $lessons[2], $module->term_id, 'module' );
		wp_set_object_terms( $course->ID, $module->term_id, 'module' );

		foreach ( $lessons as $lesson ) {
			add_post_meta( $lesson, '_lesson_course', $course->ID );
		}

		add_post_meta( $lessons[4], '_order_' . $course->ID, 1 );
		add_post_meta( $lessons[3], '_order_' . $course->ID, 2 );
		add_post_meta( $lessons[2], '_order_module_' . $module->term_id, 1 );
		add_post_meta( $lessons[0], '_order_module_' . $module->term_id, 2 );
		add_post_meta( $lessons[1], '_order_module_' . $module->term_id, 3 );

		$result = $this->export();

		$lesson_order_str = "id:{$lessons[2]},id:{$lessons[0]},id:{$lessons[1]},id:{$lessons[4]},id:{$lessons[3]}";
		$this->assertEquals( $lesson_order_str, $result[0]['lessons'] );
	}

	/**
	 * Test that course category hierarchies are exported correctly.
	 */
	public function testHierarchicalCategoriesSerialized() {

		$course = $this->factory->course->create_and_get();

		$term =
			$this->factory->term->create(
				[
					'taxonomy' => 'course-category',
					'name'     => 'Course Category Child',
					'parent'   => $this->factory->term->create(
						[
							'taxonomy' => 'course-category',
							'name'     => 'Course Category Parent',
						]
					),
				]
			);

		$this->factory->term->add_post_terms( $course->ID, $term, 'course-category', false );

		$result = $this->export();

		$this->assertEquals(
			'Course Category Parent > Course Category Child',
			$result[0]['categories']
		);

	}

	public function testModulesExported() {
		$course = $this->factory->course->create_and_get();

		$terms = [
			$this->factory->term->create(
				[
					'taxonomy' => Sensei()->modules->taxonomy,
					'name'     => 'Module A',
				]
			),
			$this->factory->term->create(
				[
					'taxonomy' => Sensei()->modules->taxonomy,
					'name'     => 'Module B',
				]
			),
		];
		$this->factory->term->add_post_terms( $course->ID, $terms, Sensei()->modules->taxonomy, false );

		$result = $this->export();

		$this->assertEquals(
			'Module A,Module B',
			$result[0]['modules']
		);
	}

	/**
	 * Test that course details are exported correctly.
	 */
	public function testCourseContentExported() {
		$course = $this->factory->course->create_and_get();

		$result = $this->export();

		$this->assertArraySubset(
			[
				'id'          => $course->ID,
				'course'      => $course->post_title,
				'slug'        => $course->post_name,
				'description' => $course->post_content,
				'excerpt'     => $course->post_excerpt,
			],
			$result[0]
		);
	}

	/**
	 * Test that course image are exported correctly.
	 */
	public function testCourseImageExported() {
		$course = $this->factory->course->create_and_get();

		$thumbnail_id = $this->factory->attachment->create(
			[
				'file'           => 'course-img.png',
				'post_mime_type' => 'image/png',
			]
		);
		set_post_thumbnail( $course, $thumbnail_id );

		$result = $this->export();

		$this->assertArraySubset(
			[
				'image' => 'http://example.org/wp-content/uploads/course-img.png',
			],
			$result[0]
		);
	}

	public function testCourseTeacherExported() {
		$teacher = $this->factory->user->create_and_get(
			[
				'user_login' => 'sensei',
				'user_email' => 'testuser@senseilms.com',
			]
		);
		$this->factory->course->create_and_get( [ 'post_author' => $teacher->ID ] );

		$result = $this->export();

		$this->assertArraySubset(
			[
				'teacher username' => $teacher->display_name,
				'teacher email'    => $teacher->user_email,

			],
			$result[0]
		);
	}

	public function testCourseMetaExported() {

		$course = $this->factory->course->create_and_get();

		update_post_meta( $course->ID, '_course_featured', true );
		update_post_meta( $course->ID, '_course_video_embed', '<iframe>' );
		update_post_meta( $course->ID, 'disable_notification', false );

		$result = $this->export();

		$this->assertArraySubset(
			[
				'featured'              => '1',
				'video'                 => '<iframe>',
				'disable notifications' => '0',
			],
			$result[0]
		);

	}

	/**
	 * Test to make sure prerequisites are exported correctly.
	 */
	public function testPrerequisiteExported() {
		$course_ids = $this->factory->course->create_many( 2 );
		add_post_meta( $course_ids[0], '_course_prerequisite', $course_ids[1] );

		$result = $this->export();

		$course_1 = self::get_by_id( $result, $course_ids[0] );
		$this->assertEquals( 'id:' . $course_ids[1], $course_1['prerequisite'] );
	}

	public function testAllPostStatusCoursesExporterd() {
		$course_published = $this->factory->course->create( [ 'post_status' => 'publish' ] );
		$course_draft     = $this->factory->course->create( [ 'post_status' => 'draft' ] );

		$result = $this->export();

		$this->assertEqualSets( [ $course_published, $course_draft ], array_column( $result, 'id' ) );

	}

	/**
	 * Test export file error handler.
	 */
	public function testExportFileErrorHandler() {
		$course = $this->factory->course->create_and_get();

		$job               = Sensei_Export_Job::create( 'test', 0 );
		$export_task_class = $this->get_task_class();
		$task              = new $export_task_class( $job );

		// Force error.
		$property = new ReflectionProperty( 'Sensei_Export_Task', 'file' );
		$property->setAccessible( true );
		$property->setValue( $task, '' );

		$task->run();

		$this->assertEquals( 'Error exporting the course file.', $job->get_logs()[0]['message'] );
	}

	protected function get_task_class() {
		return Sensei_Export_Courses::class;
	}
}
