import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useEffect } from "react";
import { fetchUserProfile } from "@/store/authSlice";

export default function Profile() {
  const dispatch = useAppDispatch();
  const { loadingProfile } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  if (loadingProfile) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Profile</h1>
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <p className="text-muted-foreground">
            Profile details will be displayed here.
          </p>
        </div>
      </div>
    </div>
  );
}
