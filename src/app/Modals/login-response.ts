import { PlanType } from "../Constant/PlanType";

export class LoginResponse {
  username: string = '';
  token: string = '';
  tokenType: string = '';
  isAuth: boolean = false;
  businessName: string = '';
  role: string = '';
  id: any;
  planType: PlanType = PlanType.BASIC;
}
