import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { courseAPI } from "../../services/api";
import { courseSchema } from "../../utils/validation";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const UpdateCourse = () => {
  const { id } = useParams();
  const [imageUploading, setImageUploading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const categories = [
    "web-development",
    "data-science",
    "design",
    "mobile",
    "marketing",
    "business",
    "photography",
    "music",
    "health",
    "language",
  ];

  // Fetch course data
  const { data: courseResponse, isLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: () => courseAPI.getCourse(id),
    enabled: !!id,
  });

  const course = courseResponse?.data?.course;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(courseSchema),
    mode: "onChange",
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: (data) => courseAPI.updateCourse(id, data),
    onSuccess: () => {
      toast.success("Course updated successfully! 🎉");
      queryClient.invalidateQueries(["my-courses"]);
      queryClient.invalidateQueries(["course", id]);
      queryClient.invalidateQueries(["courses"]);
      navigate("/my-courses");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to update course";
      toast.error(errorMessage);
      // console.error("Error updating course:", error);
    },
  });

  // Pre-fill form when course data is loaded
  useEffect(() => {
    if (course) {
      reset({
        title: course.title,
        image: course.image,
        price: course.price,
        duration: course.duration,
        category: course.category,
        description: course.description,
        isFeatured: course.isFeatured || false,
      });
    }
  }, [course, reset]);

  const imageUrl = watch("image");

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setImageUploading(true);

    try {
     
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate a unique mock URL
      const mockImageUrl = `https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80&t=${Date.now()}`;

      setValue("image", mockImageUrl, { shouldValidate: true });
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload image");
      // console.error("Image upload error:", error);
    } finally {
      setImageUploading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!isDirty) {
      toast.error("No changes detected");
      return;
    }
    updateCourseMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-error">Course not found</h1>
          <p className="text-gray-600 mt-2">
            The course you're trying to edit doesn't exist.
          </p>
          <button
            onClick={() => navigate("/my-courses")}
            className="btn btn-primary mt-4"
          >
            Back to My Courses
          </button>
        </div>
      </div>
    );
  }

  // Check if user owns the course
  if (course.instructorId !== user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-error">Access Denied</h1>
          <p className="text-gray-600 mt-2">
            You can only edit your own courses.
          </p>
          <button
            onClick={() => navigate("/my-courses")}
            className="btn btn-primary mt-4"
          >
            Back to My Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Update Course
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Make changes to your course information
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-base-200 shadow-xl"
        >
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Course Title */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Course Title *
                  </span>
                </label>
                <input
                  {...register("title")}
                  type="text"
                  placeholder="Enter an engaging course title"
                  className={`input input-bordered w-full ${
                    errors.title ? "input-error" : ""
                  }`}
                />
                {errors.title && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.title.message}
                    </span>
                  </label>
                )}
              </div>

              {/* Course Image */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Course Image *
                  </span>
                </label>

                {imageUrl && (
                  <div className="mb-4">
                    <img
                      src={imageUrl}
                      alt="Course preview"
                      className="w-full h-48 object-cover rounded-lg mb-2"
                    />
                    <p className="text-sm text-gray-500 text-center">
                      Current course image
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">
                      Upload New Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                      className="file-input file-input-bordered w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported: JPG, PNG, WebP • Max: 5MB
                    </p>
                    {imageUploading && (
                      <div className="flex items-center gap-2 mt-2">
                        <LoadingSpinner size="sm" />
                        <span className="text-sm text-gray-500">
                          Uploading image...
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">
                      Or Update Image URL
                    </label>
                    <input
                      {...register("image")}
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      className={`input input-bordered w-full ${
                        errors.image ? "input-error" : ""
                      }`}
                    />
                  </div>
                </div>

                {errors.image && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.image.message}
                    </span>
                  </label>
                )}
              </div>

              {/* Price and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Price ($) *
                    </span>
                  </label>
                  <input
                    {...register("price", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className={`input input-bordered w-full ${
                      errors.price ? "input-error" : ""
                    }`}
                  />
                  {errors.price && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.price.message}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Duration *</span>
                  </label>
                  <input
                    {...register("duration")}
                    type="text"
                    placeholder="e.g., 8 weeks, 6 months"
                    className={`input input-bordered w-full ${
                      errors.duration ? "input-error" : ""
                    }`}
                  />
                  {errors.duration && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.duration.message}
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* Category and Featured */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Category *</span>
                  </label>
                  <select
                    {...register("category")}
                    className={`select select-bordered w-full ${
                      errors.category ? "select-error" : ""
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category
                          .split("-")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.category.message}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      {...register("isFeatured")}
                      type="checkbox"
                      className="checkbox checkbox-primary"
                    />
                    <span className="label-text font-semibold">
                      Feature this course
                    </span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    Featured courses appear on the homepage
                  </p>
                </div>
              </div>

              {/* Course Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Course Description *
                  </span>
                </label>
                <textarea
                  {...register("description")}
                  rows={6}
                  placeholder="Describe what students will learn in this course..."
                  className={`textarea textarea-bordered w-full ${
                    errors.description ? "textarea-error" : ""
                  }`}
                />
                <label className="label">
                  <span className="label-text-alt">
                    {watch("description")?.length || 0} characters
                  </span>
                  {errors.description && (
                    <span className="label-text-alt text-error">
                      {errors.description.message}
                    </span>
                  )}
                </label>
              </div>

              {/* Instructor Info */}
              <div className="bg-base-300 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Instructor Information</h3>
                <div className="flex items-center gap-4">
                  <img
                    src={user?.photoURL || "/default-avatar.png"}
                    alt={user?.displayName}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium">
                      {user?.displayName || "Instructor"}
                    </p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate("/my-courses")}
                  className="btn btn-outline flex-1"
                  disabled={updateCourseMutation.isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateCourseMutation.isLoading || !isDirty}
                  className="btn btn-primary flex-1"
                >
                  {updateCourseMutation.isLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Updating Course...
                    </>
                  ) : (
                    "Update Course"
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UpdateCourse;
