// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{html,ts,css}"],
  theme: {
    extend: {
      keyframes: {
        bounceDot: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" }, // Adjust bounce height
        },
      },
      animation: {
        bounceDot: "bounceDot 0.6s infinite alternate", // Adjust duration and timing
      },
    },
  },
  plugins: [],
};
