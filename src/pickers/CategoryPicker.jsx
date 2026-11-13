import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { injectIntl } from 'react-intl';
import Cascader from 'rc-cascader';
import { styled, keyframes } from '@mui/material/styles';
import { TextField, IconButton, InputAdornment } from '@mui/material';
import { useTranslations, useGraphqlQuery, GetIconComponent } from '@openimis/fe-core';

const ArrowDropDownIcon = GetIconComponent('ArrowDropDown');
const ClearIcon = GetIconComponent('Clear');
const KeyboardArrowRightIcon = GetIconComponent('KeyboardArrowRight');
const AutorenewIcon = GetIconComponent('Autorenew');

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const StyledDiv = styled('div')({
  width: '100%',
});

const SpinningIcon = styled(AutorenewIcon)({
  animation: `${spin} 1s linear infinite`,
});

function CategoryPicker(props) {
  const {
    onChange,
    readOnly,
    required,
    value,
    label,
    placeholder,
    intl,
  } = props;
  const { formatMessage } = useTranslations('ticket');
  const [inputValue, setInputValue] = useState(value ?? '');

  useEffect(() => {
    setInputValue(value ?? '');
  }, [value]);

  // The form re-renders this picker on every keystroke typed in any of its fields, with a
  // new onChange each time. Re-rendering the Cascader makes its (closed) popup schedule
  // low-priority updates, and React 19 counts every keystroke made while they wait as a
  // nested update: past 50 it throws "Maximum update depth exceeded" (a barcode scanner, or
  // Cypress typing with no delay). So the Cascader is only re-rendered when what it shows
  // changes, and it calls the latest onChange through a ref.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const { isLoading, data, error } = useGraphqlQuery(
    `query CategoryPicker {
        grievanceConfig{
          grievanceCategoriesJson
        }
    }`,
    {},
    { skip: false },
  );

  const translateName = (name) => {
    const key = `CategoryPicker.category.${name}`;
    const translated = formatMessage(key);
    return translated !== key ? translated : name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const buildOptions = (categories) => (categories ?? []).map((cat) => ({
    label: translateName(cat.name),
    value: cat.full_name,
    children: cat.children?.length ? buildOptions(cat.children) : undefined,
  }));

  const rawJson = data?.grievanceConfig?.grievanceCategoriesJson;
  // eslint-disable-next-line react-hooks/exhaustive-deps -- formatMessage is new on every render; intl is what it depends on
  const options = useMemo(() => buildOptions(typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson), [rawJson, intl]);

  const handleClear = useCallback((e) => {
    e.stopPropagation();
    setInputValue('');
    onChangeRef.current?.(null, null);
  }, []);

  const handleCascaderChange = useCallback((values, selectedOptions = []) => {
    const selected = selectedOptions.length ? selectedOptions[selectedOptions.length - 1] : null;
    const stringValue = selected?.value ?? null;
    setInputValue(stringValue || '');
    onChangeRef.current?.(stringValue, selected);
  }, []);

  const cascaderValue = useMemo(() => {
    if (!value) {
      return [];
    }
    const parts = value.split(' > ');
    return parts.map((_, index) => parts.slice(0, index + 1).join(' > '));
  }, [value]);

  const fieldLabel = label || formatMessage('CategoryPicker.label');
  const fieldPlaceholder = placeholder ?? formatMessage('CategoryPicker.placeholder');

  return useMemo(() => (
    <StyledDiv>
      <Cascader
        value={cascaderValue}
        options={options}
        onChange={handleCascaderChange}
        changeOnSelect
        getPopupContainer={(trigger) => trigger.parentElement}
        disabled={readOnly || isLoading}
        expandIcon={<KeyboardArrowRightIcon fontSize="small" />}
        loadingIcon={<SpinningIcon fontSize="small" />}
      >
        <TextField
          label={fieldLabel}
          placeholder={fieldPlaceholder}
          required={required}
          value={inputValue}
          fullWidth
          disabled={readOnly || isLoading}
          error={!!error}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                {inputValue && !readOnly && (
                  <IconButton size="small" onClick={handleClear}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )}
                <ArrowDropDownIcon style={{ color: 'rgba(0, 0, 0, 0.54)' }} />
              </InputAdornment>
            ),
          }}
        />
      </Cascader>
    </StyledDiv>
  ), [
    cascaderValue, options, handleCascaderChange, handleClear, readOnly, isLoading, inputValue,
    fieldLabel, fieldPlaceholder, required, error,
  ]);
}

export default injectIntl(CategoryPicker);
