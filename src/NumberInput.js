import React, {useCallback, useState} from 'react';
import styled from 'styled-components';
import Web3 from 'web3';

const StyledNumberInput = styled.input`
  margin: 0;
  box-sizing: border-box;
  padding: 8px 12px;
  background: white;

  text-transform: uppercase;
  letter-spacing: 0.09em;
  font-weight: 700;
  outline: 0;
`;

const Wrapper = styled.span`
  position: relative;
  display: inline-flex;
  &:after {
    content: 'Ξ';
    display: inline-flex;
    align-items: center;
    position: absolute;
    right: 12px;
    font-size: 0.9em;
    top: 0;
    bottom: 0;
    color: #aaaaaa;
    opacity: 55%;
  }
`;

export const NumberInput = ({value, onChange}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [displayValue, setDisplayValue] = useState();
  const web3 = new Web3(window.ethereum);

  const handleChange = useCallback(
    (event) => {
      const number = Number(internalValue);
      if (!Number.isNaN(number)) {
        onChange(Number(internalValue));
        setInternalValue(number.toString());
      } else {
        setInternalValue(value);
      }
      setDisplayValue(web3.utils.fromWei(value, 'ether'));
    },
    [onChange, internalValue]
  );

  const handleInternalChange = useCallback((event) => {
    setInternalValue(event.currentTarget.value);
  }, []);

  return (
    <Wrapper>
      <StyledNumberInput
        value={displayValue}
        onBlur={handleChange}
        onChange={handleInternalChange}
      />
    </Wrapper>
  );
};
