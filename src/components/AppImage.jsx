import React from 'react';

function Image({
  src,
  alt = "Image Name",
  className = "",
  ...props
}) {
  // Ensure src is always a valid string
  const imageSrc = (src && typeof src === 'string') ? src : "/assets/images/no_image.png";

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        e.target.src = "/assets/images/no_image.png"
      }}
      {...props}
    />
  );
}

export default Image;
