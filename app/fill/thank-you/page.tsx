export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-10 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Form Submitted</h1>
        <p className="text-gray-500 text-sm">
          Your disclosure has been submitted and the PDF has been downloaded.
          The realtor will be in touch shortly.
        </p>
      </div>
    </div>
  );
}