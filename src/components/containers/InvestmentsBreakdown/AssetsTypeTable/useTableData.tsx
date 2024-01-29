const useTableData = () => {
  return [
    {
      id: 'assetType_1',
      assetType: 'Small cap funds',
      expectedPercentage: 6,
      riskGrade: 'low',
    },
    {
      id: 'assetType_2',
      assetType: 'Large Cap funds',
      expectedPercentage: 6,
      riskGrade: 'low',
    },
    {
      id: 'assetType_3',
      assetType: 'Recurring deposit',
      expectedPercentage: 6,
      riskGrade: 'high',
    },
  ];
};

export default useTableData;
