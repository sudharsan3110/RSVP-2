type IconProps = React.HTMLAttributes<SVGElement>;

export const Icons = {
  discover: (props: IconProps) => (
    <svg
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mr-2 h-5 w-5 text-white"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.5424 10C18.5424 14.6024 14.8114 18.3334 10.2091 18.3334C5.60669 18.3334 1.87573 14.6024 1.87573 10C1.87573 5.39765 5.60669 1.66669 10.2091 1.66669C14.8114 1.66669 18.5424 5.39765 18.5424 10ZM14.6909 6.7829C14.8107 6.42357 14.7171 6.0274 14.4493 5.75957C14.1815 5.49174 13.7853 5.39821 13.426 5.51799L8.12598 7.28466C7.82737 7.38419 7.59306 7.61851 7.49352 7.91711L5.72685 13.2171C5.60708 13.5764 5.7006 13.9726 5.96843 14.2404C6.23626 14.5083 6.63243 14.6018 6.99177 14.482L12.2918 12.7154C12.5904 12.6158 12.8247 12.3815 12.9242 12.0829L14.6909 6.7829ZM8.25668 11.9522L9.23277 9.02391L12.1611 8.04781L11.185 10.9761L8.25668 11.9522Z"
        fill="white"
      />
    </svg>
  ),
  lock: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="#FFFFFF"
      className="size-6"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
        clipRule="evenodd"
      />
    </svg>
  ),
};
