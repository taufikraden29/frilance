export const INPUT_STYLES = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all";

export const LABEL_STYLES = "block text-sm font-medium text-gray-300 mb-2";

export const BTN_PRIMARY = "px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40";

export const BTN_SECONDARY = "px-4 py-2.5 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all";

export const BTN_DANGER = "px-4 py-2.5 bg-red-500/20 border border-red-500/30 text-red-400 font-medium rounded-xl hover:bg-red-500/30 transition-all";

export const STATUS_STYLES = {
  pending: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  "in-progress": "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-400 border border-red-500/30",

  // Invoice statuses
  draft: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
  sent: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  paid: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  overdue: "bg-red-500/20 text-red-400 border border-red-500/30",
};
