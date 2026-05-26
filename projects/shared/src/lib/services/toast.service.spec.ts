import { ToastService } from './toast.service';

describe('ToastService', () => {
  it('adds and dismisses toasts', () => {
    const service = new ToastService();
    service.show('hello', 'success', 0);
    expect(service.toasts().length).toBe(1);
    const id = service.toasts()[0].id;
    service.dismiss(id);
    expect(service.toasts().length).toBe(0);
  });
});
