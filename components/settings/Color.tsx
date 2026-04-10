import { Label } from "../ui/label";

type Props = {
  inputRef: any;
  attribute: string;
  placeholder: string;
  attributeType: string;
  handleInputChange: (property: string, value: string) => void;
};

const Color = ({
  inputRef,
  attribute,
  placeholder,
  attributeType,
  handleInputChange,
}: Props) => (
  <div className='panel-section flex flex-col gap-3'>
    <h3 className='panel-heading'>{placeholder}</h3>
    <div
      className='flex items-center gap-3 rounded-xl border border-primary-grey-100 bg-primary-grey-200/35 px-3 py-2'
      onClick={() => inputRef.current.click()}
    >
      <input
        type='color'
        value={attribute}
        ref={inputRef}
        className='h-10 w-10 cursor-pointer rounded-lg border border-primary-grey-100 bg-transparent'
        onChange={(e) => handleInputChange(attributeType, e.target.value)}
      />
      <Label className='flex-1 font-mono text-sm text-[rgb(var(--app-text))]'>{attribute}</Label>
      <Label className='flex h-7 items-center justify-center rounded-md bg-primary-grey-100 px-2 text-[10px] uppercase tracking-[0.18em] text-primary-grey-300'>
        {attributeType}
      </Label>
    </div>
  </div>
);

export default Color;
