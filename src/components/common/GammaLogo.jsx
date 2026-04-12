import { useMemo, useState } from 'react';

const GammaLogo = ({ size = 32 }) => {
  const logoCandidates = useMemo(() => {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const fromBase = `${baseUrl}logo.png`;

    // Intentionally logo-only candidates (never favicon) for navbar branding.
    return [fromBase, '/logo.png', 'logo.png'].filter(
      (path, index, arr) => path && arr.indexOf(path) === index,
    );
  }, []);

  const [candidateIndex, setCandidateIndex] = useState(0);

  return (
    <img
      src={logoCandidates[candidateIndex]}
      alt="Gamma Index"
      width={size}
      height={size}
      className="rounded-lg object-contain"
      onError={() => {
        setCandidateIndex((current) =>
          current < logoCandidates.length - 1 ? current + 1 : current,
        );
      }}
    />
  );
};

export default GammaLogo;
