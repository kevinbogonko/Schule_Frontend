<div className="container mx-auto p-4">
  <h1 className="text-2xl font-bold mb-6">Image Upload Demo</h1>

  <div className="mb-8">
    <h2 className="text-xl font-semibold mb-4">
      Single Image Upload (Student Photos)
    </h2>
    <ImageUploader folder="student_photo" />
  </div>

  <div className="mb-8">
    <h2 className="text-xl font-semibold mb-4">
      Multiple Image Upload (Teacher Photos)
    </h2>
    <ImageUploader folder="teacher_photo" multiple={true} />
  </div>
</div>;
