import create from "zustand";

const useStore = create((set) => ({
  totalAmt: 0,
  totalEval: 0,
  totalProfit: 0,
  totalProfitRate: 0,
  setTotalAmt: (data) =>
    set({
      totalAmt: data,
    }),
  //   setTotalAmt(data) {
  //     set({ totalAmt: data });
  //   },
}));

export default useStore;
