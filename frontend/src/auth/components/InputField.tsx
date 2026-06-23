type InputFieldProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
};

function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: InputFieldProps) {
  return (
    <div>
      <label className="text-xs text-gray-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-gray-400"
      />
    </div>
  );
}

export default InputField;