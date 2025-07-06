const BudgetCard = () => {
  return (
    <div className="rounded-2xl border border-slate-200 max-w-sm">
      <div className="p-2">
        <div className="flex gap-2">
          <div>title</div>
          <div>planned</div>
          <div>remaining</div>
        </div>
        <div className="flex gap-2">
          <div>line item</div>
          <div>$0.00</div>
          <div>$0.00</div>
        </div>
        <div>Add Item</div>
      </div>
    </div>
  );
};

export default BudgetCard;
