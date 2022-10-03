import create from "zustand";
import { devtools } from "zustand/middleware";

const useStore = create(
  devtools((set) => ({
    totalAmt: "0",
    totalEval: "0",
    totalProfit: "0",
    totalProfitRate: "0",
    //   setTotalAmt: (data) =>
    //     set({
    //       totalAmt: data,
    //     }),
    setTotalAmt(data) {
      set({ totalAmt: data });
    },
    setTotalEval(data) {
      set({ totalEval: data });
    },
    setTotalProfit(data) {
      set({ totalProfit: data });
    },
    setTotalProfitRate(data) {
      set({ totalProfitRate: data });
    },
  }))
);

export default useStore;
