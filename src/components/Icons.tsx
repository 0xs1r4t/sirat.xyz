import Image from "next/image";

type IconProps = React.HTMLAttributes<SVGElement>;

export const Icons = {
  home: (props: { size: number }) => (
    <Image
      aria-hidden="true"
      width={props.size}
      height={props.size}
      src="/icons/pixel/HOUSE.svg"
      alt="home icon"
    />
  ),
  digiGarden: (props: { size: number }) => (
    <Image
      aria-hidden="true"
      width={props.size}
      height={props.size}
      src="/icons/pixel/DIGIGARDEN.svg"
      alt="digital garden icon"
    />
  ),
  palette: (props: { size: number }) => (
    <Image
      aria-hidden="true"
      width={props.size}
      height={props.size}
      src="/icons/pixel/PALETTE.svg"
      alt="palette icon"
    />
  ),
  matcha: () => (
    <Image
      aria-hidden="true"
      width={22}
      height={22}
      src="/icons/pixel/MATCHA.svg"
      alt="strawberry matcha theme icon"
    />
  ),
  iceCream: () => (
    <Image
      aria-hidden="true"
      width={22}
      height={22}
      src="/icons/pixel/ICECREAM.svg"
      alt="neopolitan ice-cream theme icon"
    />
  ),
  cheesecake: () => (
    <Image
      aria-hidden="true"
      width={22}
      height={22}
      src="/icons/pixel/CHEESECAKE.svg"
      alt="blueberry cheesecake theme icon"
    />
  ),
  link: (props: { size: number }) => (
    <Image
      aria-hidden="true"
      width={props.size}
      height={props.size}
      src="/icons/pixel/LINK.svg"
      alt="link icon"
      className="blend-link"
    />
  ),
  singleChevron: (props: IconProps) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 26 27"
      fill="currentColor"
      aria-label="single chevron icon"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8.50018 4.5L25.5002 12.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M25.5002 12.5L8.50012 21.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  ),
  doubleChevron: (props: IconProps) => (
    <svg
      aria-hidden="true"
      role="graphics-symbol"
      viewBox="0 0 16 16"
      aria-label="double chevron icon"
      className="block w-4 h-4 fill-none shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M7.07031 13.8887C7.2207 14.0391 7.40527 14.1211 7.62402 14.1211C8.06836 14.1211 8.41699 13.7725 8.41699 13.3281C8.41699 13.1094 8.32812 12.9043 8.17773 12.7539L3.37207 8.05762L8.17773 3.375C8.32812 3.21777 8.41699 3.0127 8.41699 2.80078C8.41699 2.35645 8.06836 2.00781 7.62402 2.00781C7.40527 2.00781 7.2207 2.08984 7.07031 2.24023L1.73828 7.44922C1.56055 7.62012 1.46484 7.8252 1.46484 8.06445C1.46484 8.29688 1.55371 8.49512 1.73828 8.67969L7.07031 13.8887ZM13.1748 13.8887C13.3252 14.0391 13.5098 14.1211 13.7354 14.1211C14.1797 14.1211 14.5283 13.7725 14.5283 13.3281C14.5283 13.1094 14.4395 12.9043 14.2891 12.7539L9.4834 8.05762L14.2891 3.375C14.4395 3.21777 14.5283 3.0127 14.5283 2.80078C14.5283 2.35645 14.1797 2.00781 13.7354 2.00781C13.5098 2.00781 13.3252 2.08984 13.1748 2.24023L7.84961 7.44922C7.66504 7.62012 7.57617 7.8252 7.56934 8.06445C7.56934 8.29688 7.66504 8.49512 7.84961 8.67969L13.1748 13.8887Z"
        fill="currentColor"
      ></path>
    </svg>
  ),
  doubleChevronNew: (props: { size: number }) => (
    <Image
      aria-hidden="true"
      width={props.size}
      height={props.size}
      src="/icons/clean/doubleChevronRight.svg"
      alt="double chevron icon"
    />
  ),
  search: (props: { size: number }) => (
    <Image
      aria-hidden="true"
      width={props.size}
      height={props.size}
      src="/icons/clean/search.svg"
      alt="search icon"
    />
  ),
  hamburger: (props: { size: number }) => (
    <Image
      aria-hidden="true"
      width={props.size}
      height={props.size}
      src="/icons/clean/hamburger.svg"
      alt="hamburger menu icon"
    />
  ),
  upwardArrow: (props: { size: number }) => (
    <Image
      aria-hidden="true"
      width={props.size}
      height={props.size}
      src="/icons/clean/upwardArrow.svg"
      alt="upward arrow icon"
    />
  ),
};
