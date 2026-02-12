import type { SVGProps } from 'react';

function SvgMock(props: SVGProps<SVGSVGElement>) {
  return <svg {...props} />;
}

export default SvgMock;
export { SvgMock as ReactComponent };
