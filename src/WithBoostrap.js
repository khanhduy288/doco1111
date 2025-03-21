import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const BootstrapWrapper = styled.div`
  ${props => props.bootstrapStyles}
`;

const WithBootstrap = ({ children }) => {
  const [bootstrapstyles, setBootstrapStyles] = useState('');

  useEffect(() => {
    // Dynamic import của Bootstrap CSS
    import('bootstrap/dist/css/bootstrap.min.css')
      .then(styles => {
        setBootstrapStyles(styles.default.toString());
      });

    // Clean up function
    return () => {
      setBootstrapStyles('');
    };
  }, []);

  return <BootstrapWrapper bootstrapstyles={bootstrapstyles}>{children}</BootstrapWrapper>;
};

export default WithBootstrap;