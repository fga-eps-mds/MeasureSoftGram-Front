import { PreConfigData, ReleaseInfoForm } from "@customTypes/preConfig";
import { format, addDays } from "date-fns";
import { useForm } from 'react-hook-form';
import { fireEvent, render } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import '@testing-library/jest-dom';
import BasicInfoForm from "../BasicInfoForm";

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useForm: () => ({
    control: () => ({}),
    register: () => ({}),
    watch: () => ({}),
    trigger: () => ({}),
    handleSubmit: () => jest.fn(),
  }),
}))

// Mock data for the tests
const mockConfigPageData: PreConfigData = {
  characteristics: [
    {
      key: 'reliability',
      weight: 50,
      active: true,
      subcharacteristics: [
        {
          key: 'testing_status',
          weight: 30,
          active: true,
          measures: [
            {
              key: 'passed_tests',
              active: true,
              weight: 10,
              min_threshold: 0,
              max_threshold: 100,
              metrics: []
            },
          ],
        },
      ],
      goal: 50
    },
  ],
};

const mockErrors = {};
const mockFollowLastConfig = false;
const setMockFollowLastConfig = jest.fn();

describe('BasicInfoForm', () => {
  it('should render the form fields and sections correctly', () => {
    const methods = useForm<ReleaseInfoForm>({
      mode: "all",
      defaultValues: {
        // eslint-disable-next-line sonarjs/no-duplicate-string
        end_at: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        start_at: format(new Date(), 'yyyy-MM-dd'),
        goal: 0,
        release_name: '',
        description: '',
      }
    });

    const { getByTestId } = render(
      <BasicInfoForm
        configPageData={mockConfigPageData}
        register={methods.register}
        errors={mockErrors}
        followLastConfig={mockFollowLastConfig}
        setFollowLastConfig={setMockFollowLastConfig}
        watch={methods.watch}
        trigger={methods.trigger}
      />
    );

    expect(getByTestId('apelido-release')).toBeInTheDocument();
    expect(getByTestId('descricao-release')).toBeInTheDocument();
    expect(getByTestId('inicio-release')).toBeInTheDocument();
    expect(getByTestId('fim-release')).toBeInTheDocument();
  });

  it('should handle changes to the followLastConfig checkbox', () => {
    const methods = useForm<ReleaseInfoForm>({
      mode: "all",
      defaultValues: {
        end_at: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        start_at: format(new Date(), 'yyyy-MM-dd'),
        goal: 0,
        release_name: '',
        description: '',
      }
    });

    const { getByLabelText } = render(
      <BasicInfoForm
        configPageData={mockConfigPageData}
        register={methods.register}
        errors={mockErrors}
        followLastConfig={mockFollowLastConfig}
        setFollowLastConfig={setMockFollowLastConfig}
        watch={methods.watch}
        trigger={methods.trigger}
      />
    );
    const { t } = useTranslation('plan_release');

    const checkbox = getByLabelText(t('followLastConfig')) as HTMLInputElement;
    fireEvent.click(checkbox);

    expect(setMockFollowLastConfig).toHaveBeenCalledWith(true);
  });

  it('should display the correct characteristic and subcharacteristic data', () => {
    const methods = useForm<ReleaseInfoForm>({
      mode: "all",
      defaultValues: {
        end_at: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        start_at: format(new Date(), 'yyyy-MM-dd'),
        goal: 0,
        release_name: '',
        description: '',
      }
    });

    const { getByText } = render(
      <BasicInfoForm
        configPageData={mockConfigPageData}
        register={methods.register}
        errors={mockErrors}
        followLastConfig={mockFollowLastConfig}
        setFollowLastConfig={setMockFollowLastConfig}
        watch={methods.watch}
        trigger={methods.trigger}
      />
    );


    expect(getByText('weight: 50')).toBeInTheDocument();
    expect(getByText('weight: 30')).toBeInTheDocument();
    expect(getByText('weight: 10')).toBeInTheDocument();
    expect(getByText('min = 0 | max = 100')).toBeInTheDocument();
  });
});
