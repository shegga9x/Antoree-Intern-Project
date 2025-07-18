import { courses } from "../data";
import { Course, CourseRecommendation } from "../types";
import { recommendCoursesBatch } from "./aiService";
import { getCartItemIds } from "./cartService";
import { getEnrolledCoursesID } from "./historyService";
import { getWishlist } from "./wishlistService";

export async function getRecommendedCourses(topK: number = 3): Promise<Course[]> {
    const enrolledCourses = await getEnrolledCoursesID();
    const wishlist = await getWishlist();
    const cartItemIds = await getCartItemIds();

    // Combine all course IDs to exclude from recommendations
    const excludedCourseIds = new Set([
        ...enrolledCourses,
        ...(wishlist ? wishlist : []),
        ...cartItemIds
    ]);

    // Fetch recommended courses from the AI service, passing excluded IDs
    const recommendedCoursesMap: CourseRecommendation[] = await recommendCoursesBatch(Array.from(excludedCourseIds), topK);

    // Extract course IDs from recommendations
    const recommendedCourseIds = new Set(recommendedCoursesMap.map(rec => rec.id));

    // Convert to array of Course objects
    const recommendedCourses: Course[] = courses.filter((course: Course) =>
        recommendedCourseIds.has(course.id) && !excludedCourseIds.has(course.id)
    );
    return recommendedCourses;
}