import axiosClient from "@/utils/axios-client";


export class AuthService {

  static async signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    timezone: string,
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
      timezone,
      phone,
      gymName,
      gymLocation,
      gymPhone,
      gymEmail,
      gymAddress,
    });

    return res.data;
  }

  static async signIn<T>(email: string, password: string):Promise<T> {
    const res = await axiosClient.post<T>("/auth/login", { email, password });
    return res.data; // contains {token, user}
  }

  static async signOut() {
    await axiosClient.post("/auth/logout");
  }

  static async getSession() {
    return null; // JWT stored in localStorage
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
}
