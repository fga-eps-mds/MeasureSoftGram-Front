import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { OrganizationProvider } from "@contexts/OrganizationProvider";
import { ProductProvider } from "@contexts/ProductProvider";
import { RepositoryProvider } from "@contexts/RepositoryProvider";
import ProductConfigFilterProvider from "@contexts/ProductConfigFilterProvider";
import { useProductCurrentPreConfig } from "@hooks/useProductCurrentPreConfig";
import TreeViewFilter from "../TreeViewFilter";

interface Props {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: Props) => (
  <OrganizationProvider>
    <ProductProvider>
      <RepositoryProvider>
        <ProductConfigFilterProvider>
          {children}
        </ProductConfigFilterProvider>
      </RepositoryProvider>
    </ProductProvider>
  </OrganizationProvider>
)

jest.mock("@hooks/useProductCurrentPreConfig")

const data = [
  {
    "key": "reliability",
    "weight": 100,
    "subcharacteristics": [
      {
        "key": "testing_status",
        "weight": 100,
        "measures": [
          {
            "key": "passed_tests",
            "weight": 33,
            "metrics": [
              {
                "key": "tests"
              },
              {
                "key": "test_failures"
              },
              {
                "key": "test_errors"
              }
            ]
          },
          {
            "key": "test_builds",
            "weight": 20,
            "metrics": [
              {
                "key": "test_execution_time"
              },
              {
                "key": "tests"
              }
            ],
            "max_threshold": 300000
          },
          {
            "key": "test_coverage",
            "weight": 47,
            "metrics": [
              {
                "key": "coverage"
              }
            ],
            "min_threshold": 70
          }
        ]
      }
    ]
  }
];

describe('<TreeViewFilter />', () => {
  it("should render correctly", () => {
    useProductCurrentPreConfig.mockReturnValue({
      data,
    })

    const { container } = render(<TreeViewFilter />, {
      wrapper: AllTheProviders
    });

    expect(container).toMatchSnapshot();
  });

  it("should render correctly with selected nodes", () => {
    useProductCurrentPreConfig.mockReturnValue({
      data,
    })

    const { container, rerender } = render(<TreeViewFilter />, {
      wrapper: AllTheProviders
    });

    fireEvent.click(container.querySelector('input[type="checkbox"]') as Element);
    rerender();
    expect(container).toMatchSnapshot();
  });

  it("should render correctly with selected nodes and expanded nodes", () => {
    useProductCurrentPreConfig.mockReturnValue({
      data,
    })

    const { container, rerender } = render(<TreeViewFilter />, {
      wrapper: AllTheProviders
    });

    fireEvent.click(container.querySelector('div[class="MuiTreeItem-label"]') as Element);
    rerender();
    expect(container).toMatchSnapshot();
  });

  it("should render correctly with input search", () => {
    useProductCurrentPreConfig.mockReturnValue({
      data,
    })

    const { container, rerender } = render(<TreeViewFilter />, {
      wrapper: AllTheProviders
    });

    fireEvent.change(container.querySelector('input[type="text"]') as Element, { target: { value: 'test' } });
    rerender();
    expect(container).toMatchSnapshot();
  });
});
