import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CreateCoupon = ({ backendUrl, token }) => {
  const [data, setData] = useState({
    code: "",
    discountType: "percent",
    discountValue: "",
    minOrderAmount: "",
    expiryDate: "",
  });

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        backendUrl + "/api/coupon/create",
        data,
        { headers: { token } }
      );

      if (res.data.success) {
        toast.success("Coupon created successfully!");
        setData({
          code: "",
          discountType: "percent",
          discountValue: "",
          minOrderAmount: "",
          expiryDate: "",
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="add flex justify-center items-center w-full h-[80vh]">
      <form
        className="flex flex-col gap-4 w-[400px] bg-white shadow-lg p-6 rounded-lg"
        onSubmit={onSubmitHandler}
      >
        <h2 className="text-2xl font-semibold mb-2">Create Coupon</h2>

        <input
          type="text"
          name="code"
          value={data.code}
          onChange={onChangeHandler}
          placeholder="Coupon Code (e.g. NEWUSER50)"
          className="border rounded px-3 py-2"
          required
        />

        <select
          name="discountType"
          value={data.discountType}
          onChange={onChangeHandler}
          className="border rounded px-3 py-2"
        >
          <option value="percent">Percent</option>
          <option value="flat">Flat</option>
        </select>

        <input
          type="number"
          name="discountValue"
          value={data.discountValue}
          onChange={onChangeHandler}
          placeholder="Discount Value"
          className="border rounded px-3 py-2"
          required
        />

        <input
          type="number"
          name="minOrderAmount"
          value={data.minOrderAmount}
          onChange={onChangeHandler}
          placeholder="Minimum Order Amount"
          className="border rounded px-3 py-2"
        />

        <input
          type="date"
          name="expiryDate"
          value={data.expiryDate}
          onChange={onChangeHandler}
          className="border rounded px-3 py-2"
          required
        />

        <button
          type="submit"
          className="bg-black text-white py-2 rounded hover:bg-black-700"
        >
          Create Coupon
        </button>
      </form>
    </div>
  );
};

export default CreateCoupon;
