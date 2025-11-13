import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { courseAPI } from "../../services/api";
import { courseSchema } from "../../utils/validation";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const AddCourse = () => {
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      duration: "",
      category: "web-development",
      image: "",
      isFeatured: false,
    },
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (data) => {
      // Add instructor information to course data
      const courseData = {
        ...data,
        instructor: {
          id: user?.uid,
          name: user?.displayName || "Instructor",
          email: user?.email,
          photoURL: user?.photoURL,
        },
        createdAt: new Date().toISOString(),
        students: 0,
        rating: 0,
        reviews: 0,
        status: "published",
      };

      return await courseAPI.createCourse(courseData);
    },
    onSuccess: () => {
      toast.success("Course created successfully! 🎉");
      queryClient.invalidateQueries({ queryKey: ["my-courses"] });
      reset();
      navigate("/my-courses");
    },
    onError: (error) => {
      // console.error("Error creating course:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create course"
      );
    },
  });

  const imageUrl = watch("image");
  const description = watch("description");

  // Handle image upload (mock for now)
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
      // Mock upload - replace with actual imgbb upload
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const mockImageUrl = `https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&t=${Date.now()}`;

      setValue("image", mockImageUrl, { shouldValidate: true });
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  const onSubmit = async (data) => {
    createCourseMutation.mutate(data);
  };

  const isLoading = createCourseMutation.isLoading || isSubmitting;

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
            Create New Course
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Share your knowledge with students around the world
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
                  disabled={isLoading}
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
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">
                      Upload Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={imageUploading || isLoading}
                      className="file-input file-input-bordered w-full"
                    />
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
                      Or Enter Image URL
                    </label>
                    <input
                      {...register("image")}
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      className={`input input-bordered w-full ${
                        errors.image ? "input-error" : ""
                      }`}
                      disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  >
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
                      disabled={isLoading}
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
                  disabled={isLoading}
                />
                <label className="label">
                  <span className="label-text-alt">
                    {description?.length || 0} characters
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
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary flex-1"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Creating Course...
                    </>
                  ) : (
                    "Create Course"
                  )}
                </button>
              </div>

              {/* Debug info - remove in production */}
              {!courseAPI?.createCourse && (
                <div className="alert alert-error">
                  <span>API function not available. Check services/api.js</span>
                </div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddCourse;
