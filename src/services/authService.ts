import axiosClient from "@/utils/axios-client";


export class AuthService {

  static async signUpUser(email: string, password: string, metadata?: any) {
    const res = await axiosClient.post("/auth/signup-user", {
      email,
      password,
      metadata
    });
    return res.data;
  }

  static async signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone?: string,
    gymName?: string,
    gymLocation?: string,
    gymPhone?: string,
    gymEmail?: string,
    gymAddress?: string
  ) {
    const res = await axiosClient.post("/auth/signup", {
      email,
      password,
      firstName,
      lastName,
      phone,
      gymName,
      gymLocation,
      gymPhone,
      gymEmail,
      gymAddress,
    });

    return res.data;
  }

  static async signIn(email: string, password: string) {
    const res = await axiosClient.post("/auth/login", { email, password });
    return res.data; // contains {token, user}
  }

  static async signOut() {
    await axiosClient.post("/auth/logout");
  }

  static async getSession() {
    return null; // JWT stored in localStorage
  }

  static async getCurrentUser() {
    const res = await axiosClient.get("/auth/user");
    return res.data;
  }

  static async resetPassword(email: string) {
    await axiosClient.post("/auth/reset-password", {
      email,
      redirectUrl: `${window.location.origin}/reset-password`,
    });
  }

  static async updatePassword(oldPassword: string, newPassword: string) {
    await axiosClient.post("/auth/update-password", {
      oldPassword,
      newPassword,
    });
  }

  static async deleteUser(userId: string) {
    await axiosClient.delete(`/auth/delete/${userId}`);
  }
}
