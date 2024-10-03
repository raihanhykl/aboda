export interface IUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  image: String;
  is_verified: boolean;
  roleId: number;
}

export interface IUserDetail {
  id: number;
  referral_code: string;
  f_referral_code: string;
  userId: number;
}
