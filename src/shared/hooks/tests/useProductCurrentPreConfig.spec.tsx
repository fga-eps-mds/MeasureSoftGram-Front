import React from "react";
import '@testing-library/jest-dom/extend-expect';
import { useProductCurrentPreConfig } from "@hooks/useProductCurrentPreConfig";
import { renderHook, waitFor } from "@testing-library/react";
import { OrganizationProvider } from "@contexts/OrganizationProvider";
import { ProductProvider } from "@contexts/ProductProvider";
import { RepositoryProvider } from "@contexts/RepositoryProvider";
import ProductConfigFilterProvider from "@contexts/ProductConfigFilterProvider/ProductConfigFilterProvider";
import api from "@services/api";

jest.mock("@services/api");

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

const data = {
  "id": 57,
  "name": "MeasureSoftGram",
  "data": {
    "characteristics": [
      {
        "key": "reliability",
        "weight": 50,
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
    ]
  },
  "created_at": "2023-07-08T23:30:18.537901-03:00",
  "created_config": true
};

const formattedData = [
  {
    "key": "reliability",
    "subcharacteristics": [
      {
        "key": "testing_status",
        "measures": [
          {
            "key": "passed_tests",
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
            ],
            "weight": 33
          },
          {
            "key": "test_builds",
            "max_threshold": 300000,
            "metrics": [
              {
                "key": "test_execution_time"
              },
              {
                "key": "tests"
              }
            ],
            "weight": 20
          },
          {
            "key": "test_coverage",
            "metrics": [
              {
                "key": "coverage"
              }
            ],
            "min_threshold": 70,
            "weight": 47
          }
        ],
        "weight": 100
      }
    ],
    "weight": 50
  }
]

describe("useProductCurrentPreConfig", () => {
  it("should return the current pre config", async () => {
    api.get.mockResolvedValue({
      data: data
    });

    const { result, rerender } = renderHook(() => useProductCurrentPreConfig(), {
      wrapper: AllTheProviders,
    });

    expect(api.get).toHaveBeenCalled();

    rerender();
    await waitFor(() => expect(result.current.data).toEqual(formattedData));

    rerender();
    expect(result).toMatchSnapshot();
  });
})
