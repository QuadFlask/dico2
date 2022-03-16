import styled, {css} from "styled-components";

const Flex = styled.div<{
  row?: boolean;
  wrap?: boolean;
  spaceBetween?: boolean;
  verticalCenter?: boolean;
  horizontalCenter?: boolean;
  verticalEnd?: boolean;
  horizontalEnd?: boolean;
  center?: boolean;
  width?: number;
  height?: number;
  flex?: number;
  spaced?: boolean;
  hideMinWidth?: number;
}>`
  display: flex;
  flex-direction: ${({row}) => row ? 'row' : 'column'};
  ${({wrap}) => wrap ? 'flex-wrap: wrap;' : ''}
  ${({center}) => center ? css`align-items: center; justify-content: center;` : ''}
  ${({row, verticalCenter, horizontalCenter}) => {
  if (row) return (verticalCenter ? `align-items: center;` : '') + (horizontalCenter ? `justify-content: center;` : '');
  return (horizontalCenter ? `align-items: center;` : '') + (verticalCenter ? `justify-content: center;` : '');
}}
  ${({row, verticalEnd, horizontalEnd}) => {
  if (row) return (verticalEnd ? `align-items: flex-end;` : '') + (horizontalEnd ? `justify-content: flex-end;` : '');
  return (horizontalEnd ? `align-items: flex-end;` : '') + (verticalEnd ? `justify-content: flex-end;` : '');
}}
  ${({spaceBetween}) => spaceBetween ? css`justify-content: space-between;` : ''}
  ${({width}) => width ? `width: ${cssSize(width)};` : ''}
  ${({height}) => height ? `height: ${cssSize(height)};` : ''}
  ${({flex}) => flex ? `flex: ${flex};` : ''}
  ${({spaced}) => spaced ? css`
>* {
  margin-right: 0.4em;
  &:last-child {
    margin-right: 0;
  }
}` : ''}
  ${({hideMinWidth}) => hideMinWidth ? css`
  @media (max-width: ${hideMinWidth}px) {
    display: none;
  };
` : ''}
`;

function cssSize(s: number | string) {
  if (typeof s === "number") return `${s}px`;
  return s;
}

export default Flex;
