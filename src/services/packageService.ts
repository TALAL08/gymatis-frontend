import { Package } from "@/models/interfaces/Package";
import { PaginatedResponse, PaginationParams } from "@/models/interfaces/PaginatedResponse";
import axiosClient from "@/utils/axios-client";

export class PackageService {
  /**
   * Get paginated packages for a gym
   */
  static async getPackagesByGymPaginated(
    gymId: number,
    params: PaginationParams
  ): Promise<PaginatedResponse<Package>> {
    const res = await axiosClient.get<PaginatedResponse<Package>>(`/packages/gym/${gymId}/paginated`, {
      params: {
        pageNo: params.pageNo,
        pageSize: params.pageSize,
        searchText: params.searchText || '',
      },
    });
    return res.data;
  }

  /**
   * Get all packages for a gym
   */
  static async getPackagesByGym(gymId: number): Promise<Package[]> {
    const res = await axiosClient.get<Package[]>(`/packages/gym/${gymId}`);
    return res.data ;
  }

  /**
   * Get active packages for a gym
   */
  static async getActivePackages(gymId: number): Promise<Package[]> {
    const res = await axiosClient.get(`/packages/gym/${gymId}/active`);
    return res.data as Package[];
  }

  /**
   * Get a single package by ID
   */
  static async getPackageById(packageId: number): Promise<Package> {
    const res = await axiosClient.get(`/packages/${packageId}`);
    return res.data as Package;
  }

  /**
   * Create a new package
   */
  static async createPackage(packageData: any): Promise<Package> {
    const res = await axiosClient.post(`/packages`, packageData);
    return res.data as Package;
  }

  /**
   * Update a package
   */
  static async updatePackage(packageId: number, updates: any): Promise<Package> {
    const res = await axiosClient.put(`/packages/${packageId}`, updates);
    return res.data as Package;
  }

  /**
   * Delete a package
   */
  static async deletePackage(packageId: number): Promise<void> {
    await axiosClient.delete(`/packages/${packageId}`);
  }

  /**
   * Toggle package active status
   */
  static async togglePackageStatus(packageId: number, isActive: boolean): Promise<Package> {
    const res = await axiosClient.patch(`/packages/${packageId}/status`, {
      isActive,
    });
    return res.data as Package;
  }
}
