import React, { Suspense } from 'react';

const LazyComponent = ({
  component: Component,
  fallback = <div className="loading-skeleton">Loading...</div>,
  ...props
}) => {
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
};

export default LazyComponent;
