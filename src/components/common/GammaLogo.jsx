const GammaLogo = ({ size = 32 }) => (
  <img
    src={`${import.meta.env.BASE_URL}logo.png`}
    alt="Gamma Index"
    width={size}
    height={size}
    className="rounded-lg object-contain"
  />
);

export default GammaLogo;
