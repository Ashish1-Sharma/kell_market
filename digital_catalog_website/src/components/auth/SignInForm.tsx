import { useState } from "react";
import axios from "axios";
// import { Link } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import {
  authConstants,
  BASE_URL,
  // parentUser,
  validateEmail,
} from "../../utils/constants.tsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// import { BASE_URL } from "../../utils/constants.tsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const Button: React.FC<ButtonProps> = ({ className, size, ...props }) => {
  // You can dynamically set different sizes if needed (sm, md, lg)
  const sizeClasses =
    size === "sm"
      ? "py-2 px-4 text-sm"
      : size === "md"
      ? "py-3 px-6 text-md"
      : "py-4 px-8 text-lg";

  return (
    <button
      className={`btn bg-blue-500 text-white hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 rounded-sm ${sizeClasses} ${className}`}
      {...props}
    />
  );
};

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const navigate = useNavigate();

  // Form submission handler
const handleLogin = async (
  e: React.FormEvent<HTMLFormElement>
): Promise<void> => {
  e.preventDefault();

  if (!validateEmail(email)) {
    toast.error("Please enter a valid email address.");
    return;
  }

  if (!password) {
    toast.error("Password is required.");
    return;
  }

  try {
const response = await axios.get(
  `${BASE_URL}/login.php`,
  {
    params: {
      email: email,
      phone_number: email,
      password: password,
    },
  }
);



    const data = response.data;

if (data.res_code === "200") {
    const purchaseFlag = Number(data.user_info?.purchase_flag);


  

  // ❌ BLOCK ACCESS IF NOT PURCHASED
  if (purchaseFlag !== 1) {
    toast.error("Your plan is inactive. Please purchase to continue.");
    return;
  }
  localStorage.setItem(
    authConstants.USER_DATA,
    JSON.stringify(data.user_info)
  );

  localStorage.setItem(authConstants.IS_AUTHENTICATED, "true");

  // ✅ ADD THIS
  const expiryTime = new Date().getTime() + 60 * 60 * 1000; // 1 hour
  localStorage.setItem(
    authConstants.EXPIRY_TIME,
    expiryTime.toString()
  );

  toast.success("Login successful!");

  setTimeout(() => {
    navigate("/home", { replace: true });
  }, 800);
}
else {
      toast.error(data.message || "Login failed");
    }
  } catch (error: any) {
    console.error("Login error:", error);
    toast.error("Unable to login. Please try again.");
  }
};


  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">

        <div>
          <h1 className="mb-4 font-semibold text-gray-900 text-title-sm dark:text-white/90 sm:text-title-md">
            Welcome to Kell Plus Admin panel
          </h1>
          <div className="mb-5 sm:mb-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <form onSubmit={handleLogin} noValidate>
              <div className="space-y-6">
                {/* Email Field */}
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="info@gmail.com"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                  />
                </div>
                {/* Password Field */}
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      name="password"
                      className="pr-12"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPassword(e.target.value)
                      }
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isChecked}
                      onChange={(checked: boolean) => setIsChecked(checked)}
                    />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  {/* <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link> */}
                </div>
                {/* Submit Button */}
                <div>
                  {/* <Button className="w-full" size="sm" type="submit">
                    Sign in
                  </Button> */}

                  <Button className="w-full" size="sm">
                    Sign in
                  </Button>
                </div>
              </div>
            </form>

            {/* Sign Up Link */}
            {/* <div className="flex mt-5 justify-between">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Login as a staff?{" "}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Staff Login
                </Link>
               
              </p>
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Reset your password

?{" "}
               <Link
                  to="/forgetpassword"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Forgot Password
                </Link>
                </p>
            </div>
            <div className="flex mt-5 justify-between">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Please register first ?{" "}
                <Link
                  to="/register"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Register 
                </Link>
               
              </p>
              
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
