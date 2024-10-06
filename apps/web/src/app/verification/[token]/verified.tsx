import { ErrorMessage } from '@hookform/error-message';
import React from 'react';

type Props = {
  handleSubmit: (data: any) => void;
  register: any;
  errors: any;
};

export default function VerifiedComponent({
  handleSubmit,
  register,
  errors,
}: Props) {
  return (
    <div className=" bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify Email and Set Password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Set Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  required
                  {...register({ register })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
            </div>
            <ErrorMessage errors={errors} name={'password'} />

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Verify and Set Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
